import { createJobSignals, notifyStartJobs, requestJobToProcess, waitForAllJobsToComplete } from '../workers/jobs.js';
import { BootMessage } from '../workers/secondary.worker.js';
import { Board, Cells, DONT_SKIP, fillSkips, flipBoardIo, getBoardIo, skipI, Skips, SKIP_MULTIPLYER } from './board.js';
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
  outSkip[skipI(i - width - 1)] = DONT_SKIP;
  outSkip[skipI(i - width)] = DONT_SKIP;
  outSkip[skipI(i - width + 1)] = DONT_SKIP;
  outSkip[skipI(i - 1)] = DONT_SKIP;
  outSkip[skipI(i)] = DONT_SKIP;
  outSkip[skipI(i + 1)] = DONT_SKIP;
  outSkip[skipI(i + width - 1)] = DONT_SKIP;
  outSkip[skipI(i + width)] = DONT_SKIP;
  outSkip[skipI(i + width + 1)] = DONT_SKIP;
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
  fillSkips(outSkip, i + width - 1, endI - width + 1);
  while (i < endI) {
    while (inSkip[skipI(i)]) i += SKIP_MULTIPLYER;

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

const setSkipBorders = (board: Board, jobs: [number, number][]) => {
  const { width } = board;
  const { outSkips } = getBoardIo(board);

  for (let i = 0; i < jobs.length; i++) {
    const [beginI] = jobs[i];
    fillSkips(outSkips, beginI - width - 1, beginI + width - 1);
  }
};

export const startNextBoardLoop = (generationsAndMax: Uint32Array, board: Board, workers: Worker[]) => {
  const jobs = createJobs(PROBABLY_OPTIMAL_JOB_COUNT, board.width, board.height);
  const signals = createJobSignals(jobs.length);

  const processJobI = (i: number) => {
    const [beginI, endI] = jobs[i];
    const { input, output, inSkips, outSkips } = getBoardIo(board);
    nextBoardSection(beginI, endI, board.width, input, output, inSkips, outSkips);
  };

  // Note: likely improvements by moving this into the setup function
  workers.forEach(worker => {
    const message: BootMessage = {
      board,
      jobs,
      signals,
    };
    worker.postMessage(message);
  });

  while (generationsAndMax[0] < generationsAndMax[1]) {
    // Pre-processing
    flipBoardIo(board);
    setSkipBorders(board, jobs);

    // Processing
    notifyStartJobs(signals);
    while (requestJobToProcess(signals, processJobI)) {}
    waitForAllJobsToComplete(signals);

    // Post-processing
    assignBoardPadding(board);
    generationsAndMax[0]++;
  }
};
