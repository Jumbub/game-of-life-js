import { Board } from '../logic/board.js';
import { JobSignals, requestJobToProcess, waitForJobs } from './jobs.js';
import { notifyReady } from './ready.js';

export type BootMessage = {
  board: Board;
  jobs: [beginI: number, endI: number][];
  signals: JobSignals;
};

onmessage = ({ data: { board, jobs, signals } }: MessageEvent<BootMessage>) => {
  while (waitForJobs(signals)) {
    while (requestJobToProcess(signals, jobs, board)) {}
  }
};

notifyReady();
