import { sleep } from '../common/sleep.js';
import { Board, getBoardIo } from './board.js';
import { nextBoardSection, processJobs } from './next.js';

export type BootMessage = {
  board: Board;
  jobs: [beginI: number, endI: number][];
  nextJob: Int32Array;
  doneJobs: Int32Array;
  allJobsDone: Int32Array;
};

addEventListener('message', async (event: MessageEvent<BootMessage>) => {
  // Wait for "start scanning" message
  const { board, jobs, nextJob, doneJobs, allJobsDone } = event.data;

  while (Atomics.wait(doneJobs, 0, jobs.length)) {
    processJobs(board, jobs, nextJob, doneJobs, allJobsDone);
    Atomics.wait(allJobsDone, 0, 0);
  }
});

postMessage('ready');
