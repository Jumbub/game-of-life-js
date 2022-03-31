import { Board } from '../logic/board.js';
import { nextBoardSection } from '../logic/next.js';

enum Index {
  JOB_COUNT,
  NEXT_JOB,
  CONSUMED_ALL,
  DONE_COUNT,
  DONE_ALL,
}

export type JobSignals = Int32Array;

export const createJobSignals = (jobCount: number) => {
  const signals = new Int32Array(new SharedArrayBuffer(4 * 5));
  Atomics.store(signals, Index.JOB_COUNT, jobCount);
  Atomics.store(signals, Index.NEXT_JOB, jobCount);
  Atomics.store(signals, Index.DONE_COUNT, jobCount);
  Atomics.store(signals, Index.CONSUMED_ALL, 1);
  Atomics.store(signals, Index.DONE_ALL, 1);
  return signals;
};

export const waitForJobs = (signals: JobSignals) =>
  Atomics.wait(signals, Index.CONSUMED_ALL, 1) && Atomics.wait(signals, Index.DONE_ALL, 1);

export const notifyStartJobs = (signals: JobSignals) => {
  Atomics.store(signals, Index.NEXT_JOB, 0);
  Atomics.store(signals, Index.DONE_COUNT, 0);
  Atomics.store(signals, Index.CONSUMED_ALL, 0);
  Atomics.store(signals, Index.DONE_ALL, 0);
  Atomics.notify(signals, Index.CONSUMED_ALL);
  Atomics.notify(signals, Index.DONE_ALL);
};

export const requestJobToProcess = (signals: JobSignals, jobs: number[][], board: Board) => {
  const jobI = Atomics.add(signals, Index.NEXT_JOB, 1);
  if (jobI >= signals[Index.JOB_COUNT]) {
    Atomics.store(signals, Index.CONSUMED_ALL, 1);
    return false;
  }

  nextBoardSection(
    jobs[jobI][0],
    jobs[jobI][1],
    board.width,
    board.cells[board.cellsInput[0]],
    board.cells[1 - board.cellsInput[0]],
    board.skips[board.skipsInput[0]],
    board.skips[1 - board.skipsInput[0]],
  );

  const previousDoneCount = Atomics.add(signals, Index.DONE_COUNT, 1);
  const isLastJobDone = previousDoneCount === signals[Index.JOB_COUNT] - 1;
  if (isLastJobDone) {
    Atomics.store(signals, Index.DONE_ALL, 1);
    Atomics.notify(signals, Index.DONE_ALL);
    return false;
  }

  return true;
};

export const waitForAllJobsToComplete = (signals: JobSignals) => {
  Atomics.wait(signals, Index.DONE_ALL, 0);
};
