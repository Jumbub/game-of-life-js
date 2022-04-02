import { Board, getBoardIo } from '../logic/board';
import { DONE, Jobs, JobsDone, nextBoardSection, Times } from '../logic/next';
import { notifyReady } from './ready';

export type BootMessage = {
  board: Board;
  jobI: number;
  jobs: Jobs;
  jobsDone: JobsDone;
  times: Times;
};

onmessage = ({ data: { board, jobI, jobs, jobsDone, times } }: MessageEvent<BootMessage>) => {
  while (Atomics.wait(jobsDone, jobI, DONE)) {
    const start = performance.now();
    const { input, output, inSkips, outSkips } = getBoardIo(board);
    nextBoardSection(
      Atomics.load(jobs, jobI * 2) + 1,
      Atomics.load(jobs, jobI * 2 + 1) - 1,
      board.width,
      input,
      output,
      inSkips,
      outSkips,
    );
    const end = performance.now();
    Atomics.store(times, jobI, (end - start) * 1000);
    Atomics.store(jobsDone, jobI, DONE);
    Atomics.notify(jobsDone, jobI);
  }
};

notifyReady();
