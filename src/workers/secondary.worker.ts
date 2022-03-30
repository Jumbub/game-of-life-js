import { Board, getBoardIo } from '../logic/board.js';
import { nextBoardSection } from '../logic/next.js';
import { JobSignals, requestJobToProcess, waitForJobs } from './jobs.js';
import { notifyReady } from './ready.js';

export type BootMessage = {
  board: Board;
  jobs: [beginI: number, endI: number][];
  signals: JobSignals;
};

onmessage = ({ data: { board, jobs, signals } }: MessageEvent<BootMessage>) => {
  const processJobI = (i: number) => {
    const [beginI, endI] = jobs[i];
    const { input, output, inSkips, outSkips } = getBoardIo(board);
    nextBoardSection(beginI, endI, board.width, input, output, inSkips, outSkips);
  };
  while (waitForJobs(signals)) {
    while (requestJobToProcess(signals, processJobI)) {}
  }
};

notifyReady();
