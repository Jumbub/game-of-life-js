import { Board } from '../logic/board.js';
import { createJobs, startNextBoardLoop } from '../logic/next.js';
import { createJobSignals } from './jobs.js';
import { notifyReady } from './ready.js';
import { secondaryFactoryMulti } from './secondary.js';
import { BootMessage } from './secondary.worker.js';

export type BootPrimaryMessage = {
  board: Board;
  workerCount: number;
  jobCount: number;
  generationsAndMax: Uint32Array; // [computations, maxGenerations]
};

export type StartPrimaryMessage = unknown;

onmessage = async (event: MessageEvent<BootPrimaryMessage>) => {
  const {
    data: { jobCount, workerCount, board, generationsAndMax },
  } = event;
  const secondaryWorkers = await secondaryFactoryMulti(workerCount - 1);
  const signals = createJobSignals(jobCount);
  const jobs = createJobs(jobCount, board.width, board.height);

  secondaryWorkers.forEach(worker => {
    const message: BootMessage = {
      jobs,
      board,
      signals,
    };
    worker.postMessage(message);
  });

  onmessage = () => {
    startNextBoardLoop(generationsAndMax, board, jobCount, signals);
  };

  notifyReady();
};
