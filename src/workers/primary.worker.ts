import { Board } from '../logic/board';
import { startNextBoardLoop } from '../logic/next';
import { notifyReady } from './ready';
import { secondaryFactoryMulti } from './secondary';

export type WorkerCountMessage = number;

export type StartPrimaryMessage = {
  generationsAndMax: Uint32Array; // [computations, maxGenerations]
  board: Board;
};

onmessage = async (event: MessageEvent<WorkerCountMessage>) => {
  const secondaryWorkers = await secondaryFactoryMulti(event.data - 1);

  onmessage = (event: MessageEvent<StartPrimaryMessage>) => {
    startNextBoardLoop(event.data.generationsAndMax, event.data.board, secondaryWorkers);

    secondaryWorkers.forEach(worker => worker.terminate());
  };

  notifyReady();
};
