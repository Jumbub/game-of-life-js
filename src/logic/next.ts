import { BootMessage } from '../workers/secondary.worker.js';
import { Board, Cells, DONT_SKIP, flipBoardIo, getBoardIo, SKIP, Skips, SKIP_MULTIPLYER } from './board.js';
import { assignBoardPadding } from './padding.js';
import { PROBABLY_OPTIMAL_JOB_COUNT } from './threads.js';

export const LOOKUP = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0] as const;

const isAlive = (i: number, cells: Cells, width: number) => {
  const sum =
    cells[i - width - 1] +
    cells[i - width] +
    cells[i - width + 1] +
    cells[i - 1] +
    cells[i] * 9 + // Notice the `* 9` here
    cells[i + 1] +
    cells[i + width - 1] +
    cells[i + width] +
    cells[i + width + 1];
  return LOOKUP[sum];
};

const revokeSkipForNeighbours = (i: number, outSkip: Skips, width: number) => {
  outSkip[Math.floor((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - width) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor(i / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
};

export const nextBoardSection = (
  i: number,
  endI: number,
  width: number,
  input: Cells,
  output: Cells,
  inSkip: Skips,
  outSkip: Skips,
) => {
  while (i < endI) {
    while (inSkip[Math.floor(i / SKIP_MULTIPLYER)]) i += SKIP_MULTIPLYER;

    output[i] = isAlive(i, input, width);

    if (input[i] !== output[i]) {
      revokeSkipForNeighbours(i, outSkip, width);
    }

    i++;
  }
};

export const processJobs = (
  board: Board,
  jobs: [beginI: number, endI: number][],
  nextJob: Int32Array,
  doneJobs: Int32Array, // TODO: Investigate computing this value from  "nextJob + total workers"
  allJobsDone: Int32Array,
) => {
  const nJobs = jobs.length;
  let job = Atomics.add(nextJob, 0, 1);
  while (job < nJobs) {
    const [beginI, endI] = jobs[job];
    const { input, output, inSkips, outSkips } = getBoardIo(board);
    nextBoardSection(beginI, endI, board.width, input, output, inSkips, outSkips);

    const previousDoneCount = Atomics.add(doneJobs, 0, 1);
    if (previousDoneCount === nJobs - 1) {
      // Notify that all workers are done
      allJobsDone[0] = 1;
      Atomics.notify(allJobsDone, 0);
    }

    job = Atomics.add(nextJob, 0, 1);
  }
};

const createJobs = (segments: number, width: number, height: number): [number, number][] => {
  let endI = width;
  const segmentSize = (Math.floor(height / segments) + (height % segments)) * width;
  return [...Array(segments)].map(() => {
    const beginI = endI + 1;
    endI = Math.min(width * (height - 1), endI + segmentSize);
    return [beginI, endI - 1];
  });
};

export const startNextBoardLoop = (generationsAndMax: Uint32Array, board: Board, workers: Worker[]) => {
  const jobs = createJobs(PROBABLY_OPTIMAL_JOB_COUNT, board.width, board.height);
  const nextJob = new Int32Array(new SharedArrayBuffer(4));
  const doneJobs = new Int32Array(new SharedArrayBuffer(4));
  const allJobsDone = new Int32Array(new SharedArrayBuffer(4));
  nextJob[0] = 0;
  doneJobs[0] = jobs.length;
  allJobsDone[0] = 0;

  // Boot workers
  workers.forEach(worker => {
    const message: BootMessage = {
      board,
      jobs,
      nextJob,
      doneJobs,
      allJobsDone,
    };
    worker.postMessage(message);
  });

  // Processing loop
  while (generationsAndMax[0] < generationsAndMax[1]) {
    // Pre-processing
    flipBoardIo(board);
    board.skips[1 - board.skipsInput[0]].fill(SKIP);

    // Processing
    allJobsDone[0] = 0;
    nextJob[0] = 0;
    doneJobs[0] = 0;
    Atomics.notify(doneJobs, 0);
    processJobs(board, jobs, nextJob, doneJobs, allJobsDone);

    Atomics.wait(allJobsDone, 0, 0); // Wait if 0

    // Post-processing
    assignBoardPadding(board);

    generationsAndMax[0]++;
  }
};
