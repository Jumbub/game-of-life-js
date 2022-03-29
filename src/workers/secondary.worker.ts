import { Board } from '../logic/board.js';
import { processJobs } from '../logic/next.js';
import { notifyReady } from './ready.js';

export type BootMessage = {
  board: Board;
  jobs: [beginI: number, endI: number][];
  nextJob: Int32Array;
  doneJobs: Int32Array;
  allJobsDone: Int32Array;
};

onmessage = ({ data: { board, jobs, nextJob, doneJobs, allJobsDone } }: MessageEvent<BootMessage>) => {
  while (Atomics.wait(doneJobs, 0, jobs.length)) {
    processJobs(board, jobs, nextJob, doneJobs, allJobsDone);
    Atomics.wait(allJobsDone, 0, 0);
  }
};

notifyReady();
