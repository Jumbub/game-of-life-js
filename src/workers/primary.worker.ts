import { Board } from '../logic/board.js';
import { startNextBoardLoop } from '../logic/next.js';
import { PROBABLY_OPTIMAL_THREAD_COUNT } from '../logic/threads.js';
import { notifyReady } from './ready.js';
import { secondaryFactoryMulti } from './secondary.js';

export type BootPrimaryMessage = {
  generationsAndMax: Uint32Array; // [computations, maxGenerations]
  board: Board;
};

const secondaryWorkers = await secondaryFactoryMulti(PROBABLY_OPTIMAL_THREAD_COUNT - 1);

onmessage = (event: MessageEvent<BootPrimaryMessage>) => {
  startNextBoardLoop(event.data.generationsAndMax, event.data.board, secondaryWorkers);
};

notifyReady();
