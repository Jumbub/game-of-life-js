import { BootMessage } from '../workers/secondary.worker';
import { Board, Cells, DONT_SKIP, fillSkips, flipBoardIo, getBoardIo, Skips, SKIP_MULTIPLYER } from './board';
import { assignBoardPadding } from './padding';

export type JobsDone = Int32Array;
export type Jobs = Int32Array;
export const DONE = 1;
export const NOT_DONE = 0;

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
  outSkip[~~((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
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
    while (inSkip[~~(i / SKIP_MULTIPLYER)]) i += SKIP_MULTIPLYER;

    output[i] = isAlive(i, input, width);

    if (input[i] !== output[i]) {
      revokeSkipForNeighbours(i, outSkip, width);
    }

    i++;
  }
};

const setSkipBorders = (board: Board, jobs: Jobs) => {
  const { width } = board;
  const { outSkips } = getBoardIo(board);

  for (let i = 0; i < jobs.length; i++) {
    const beginI = jobs[i * 2];
    fillSkips(outSkips, beginI - width - 1, beginI + width - 1);
  }
  // TODO: add fillskips for last region
};

const assignBaseJobs = (jobs: Jobs, { width, height }: Board, segments: number) => {
  const cellsPerSegment = (width * height - width * 2) / segments;
  Array(segments)
    .fill(0)
    .map((_, i) => {
      return [
        width + Math.floor((i * cellsPerSegment) / width) * width,
        width + Math.min(width * height, Math.floor(((i + 1) * cellsPerSegment) / width) * width),
      ];
    })
    .forEach(([beginI, endI], i) => {
      jobs[i * 2] = beginI;
      jobs[i * 2 + 1] = endI;
    });
};

export const startNextBoardLoop = (generationsAndMax: Uint32Array, board: Board, workers: Worker[], _: number) => {
  const jobsDone = new Int32Array(new SharedArrayBuffer(workers.length * Int32Array.BYTES_PER_ELEMENT));
  const jobs = new Int32Array(new SharedArrayBuffer(2 * (workers.length + 1) * Int32Array.BYTES_PER_ELEMENT));

  assignBaseJobs(jobs, board, workers.length + 1);

  // Note: likely improvements by moving this into the setup function
  workers.forEach((worker, jobI) => {
    const message: BootMessage = {
      jobI,
      board,
      jobs,
      jobsDone,
    };
    worker.postMessage(message);
  });

  while (generationsAndMax[0] < generationsAndMax[1]) {
    // Pre-processing
    flipBoardIo(board);
    setSkipBorders(board, jobs);

    // Processing
    jobsDone.forEach((_, i) => {
      Atomics.store(jobsDone, i, NOT_DONE);
      Atomics.notify(jobsDone, i);
    });
    const { input, output, inSkips, outSkips } = getBoardIo(board);
    console.log(jobs);
    nextBoardSection(jobs[jobs.length - 2], jobs[jobs.length - 1], board.width, input, output, inSkips, outSkips);
    jobsDone.forEach((_, i) => Atomics.wait(jobsDone, i, NOT_DONE));

    // Post-processing
    assignBoardPadding(board);
    generationsAndMax[0]++;
  }
};
