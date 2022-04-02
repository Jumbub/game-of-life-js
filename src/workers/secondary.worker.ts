import { Board, getBoardIo } from '../logic/board';
import { DONE, Jobs, JobsDone, nextBoardSection } from '../logic/next';
import { notifyReady } from './ready';

export type BootMessage = {
  board: Board;
  jobI: number;
  jobs: Jobs;
  jobsDone: JobsDone;
};

onmessage = ({ data: { board, jobI, jobs, jobsDone } }: MessageEvent<BootMessage>) => {
  console.log('hi', jobI);
  while (Atomics.wait(jobsDone, jobI, DONE)) {
    const { input, output, inSkips, outSkips } = getBoardIo(board);
    nextBoardSection(jobs[jobI * 2], jobs[jobI * 2 + 1], board.width, input, output, inSkips, outSkips);
    Atomics.store(jobsDone, jobI, DONE);
    Atomics.notify(jobsDone, jobI);
  }
  console.log('quit');
};

notifyReady();
