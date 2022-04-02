import { BootMessage } from '../workers/secondary.worker';
import { Board, Cells, DONT_SKIP, fillSkips, flipBoardIo, getBoardIo, Skips, SKIP_MULTIPLYER } from './board';
import { assignBoardPadding } from './padding';

export type JobsDone = Int32Array;
export type Jobs = Int32Array;
export type Times = Int32Array;
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
  if ((i - 1) % 2562 !== 0) debugger;
  if ((endI + 1) % 2562 !== 0) debugger;
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
  const { outSkips } = getBoardIo(board);
  const { width, height } = board;

  for (let i = 0; i < jobs.length / 2; i++) {
    const beginI = Atomics.load(jobs, i * 2);
    const start = Math.min(Math.max(beginI - width, 0), width * height);
    const stop = Math.min(Math.max(beginI + width, 0), width * height);
    fillSkips(outSkips, start, stop);
  }
  fillSkips(outSkips, width * (height - 2), width * height);
};

const sum = (arr: number[]) => arr.reduce((acc, cur) => acc + cur, 0);
const assignJobs = (jobs: Jobs, rawTimes: Times, { width, height }: Board) => {
  const times = Array(rawTimes.length)
    .fill(0)
    // .map((_, i) => Math.pow(i + 1, 2))
    .map((_, i) => rawTimes[i])
    .map(value => Math.max(1, value));
  const maxTime = times.reduce((acc, cur) => Math.max(acc, cur), 0);
  const invTimes = times.map(time => Math.log2(1 + maxTime / time));
  const sumInvTimes = sum(invTimes);
  const ratios = invTimes.map(time => time / sumInvTimes);

  const ratiosAccum = ratios
    .reduce(
      (acc, cur) => {
        const lastEndI = acc[acc.length - 1][1];
        return [...acc, [lastEndI, lastEndI + cur]];
      },
      [[0, 0]],
    )
    .slice(1);
  const computeSize = width * (height - 2);
  const segments = ratiosAccum.map(([beginI, endI]) => [
    width + Math.floor((beginI * computeSize) / width) * width,
    width + Math.min(Math.floor((endI * computeSize) / width) * width, computeSize),
  ]);

  for (let i = 0; i < rawTimes.length; i++) {
    Atomics.store(jobs, i * 2, segments[i][0]);
    Atomics.store(jobs, i * 2 + 1, segments[i][1]);
  }
};

export const startNextBoardLoop = (generationsAndMax: Uint32Array, board: Board, workers: Worker[]) => {
  const jobsDone = new Int32Array(new SharedArrayBuffer(workers.length * Int32Array.BYTES_PER_ELEMENT));
  const jobs = new Int32Array(new SharedArrayBuffer(2 * (workers.length + 1) * Int32Array.BYTES_PER_ELEMENT));
  const times = new Int32Array(new SharedArrayBuffer((workers.length + 1) * Int32Array.BYTES_PER_ELEMENT));

  jobsDone.forEach((_, i) => Atomics.store(jobsDone, i, DONE));
  times.forEach((_, i) => Atomics.store(times, i, 1));

  // Note: likely improvements by moving this into the setup function
  workers.forEach((worker, jobI) => {
    const message: BootMessage = {
      jobI,
      board,
      jobs,
      jobsDone,
      times,
    };
    worker.postMessage(message);
  });

  while (generationsAndMax[0] < generationsAndMax[1]) {
    // Pre-processing
    flipBoardIo(board);
    assignJobs(jobs, times, board);
    setSkipBorders(board, jobs);

    // Processing
    jobsDone.forEach((_, i) => {
      Atomics.store(jobsDone, i, NOT_DONE);
      Atomics.notify(jobsDone, i);
    });
    const start = performance.now();
    const { input, output, inSkips, outSkips } = getBoardIo(board);
    nextBoardSection(
      Atomics.load(jobs, jobs.length - 2) + 1,
      Atomics.load(jobs, jobs.length - 1) - 1,
      board.width,
      input,
      output,
      inSkips,
      outSkips,
    );
    const end = performance.now();
    Atomics.store(times, times.length - 1, (end - start) * 1000);
    jobsDone.forEach((_, i) => {
      console.log(Atomics.wait(jobsDone, i, NOT_DONE));
    });

    console.log('pri finished waiting');

    // Post-processing
    assignBoardPadding(board);
    generationsAndMax[0]++;
  }
};
