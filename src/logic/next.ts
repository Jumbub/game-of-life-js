import { Meta } from '../graphics/loop.js';
import { Board, Cells, DONT_SKIP, Skip, SKIP, Skips, SKIP_MULTIPLYER } from './board.js';
import { assignBoardPadding } from './padding.js';

export const LOOKUP = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0] as const;

const isAlive = (i: number, cells: Cells, width: number) => {
  const sum =
    cells[i - width - 1] +
    cells[i - width] +
    cells[i - width + 1] +
    cells[i - 1] +
    cells[i] * 9 + // Notice the `* 9` here
    cells[i + 1] +
    cells[i + width - 1] +
    cells[i + width] +
    cells[i + width + 1];
  return LOOKUP[sum];
};

const revokeSkipForNeighbours = (i: number, outSkip: Skips, width: number) => {
  outSkip[Math.floor((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - width) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor(i / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
};

export const next = (board: Board) => {
  [board.input, board.output, board.inSkip, board.outSkip] = [board.output, board.input, board.outSkip, board.inSkip];

  board.outSkip.fill(SKIP);

  let i = board.width + 1;
  const endI = board.width * (board.height - 1) - 1;
  while (i < endI) {
    while (board.inSkip[Math.floor(i / SKIP_MULTIPLYER)]) i += SKIP_MULTIPLYER;

    board.output[i] = isAlive(i, board.input, board.width);

    if (board.input[i] !== board.output[i]) {
      revokeSkipForNeighbours(i, board.outSkip, board.width);
    }

    i++;
  }

  assignBoardPadding(board);
};

export const startNextBoardLoop = (meta: Meta & { loop?: () => void }) => {
  // let endI = meta.board.width;
  // const segmentSize = (meta.board.height / JOBS + meta.board.height % JOBS) * meta.board.width;
  // const segments = Array(JOBS).fill(1).map(() => {
  //   const beginI = endI;
  //   endI = Math.min(meta.board.width*(meta.board.height-1), endI + segmentSize)
  //   return {
  //     beginI,
  //     endI,
  //   };
  // })
  const loop = () => {
    meta.workers.forEach(worker => {
      const handleWorkerMessage = (event: MessageEvent<Board>) => {
        worker.removeEventListener('message', handleWorkerMessage);
        meta.board = event.data;
        meta.generations++;
        if (meta.generations < meta.maxGenerations) {
          setTimeout(loop, 0);
        }
      };
      worker.addEventListener('message', handleWorkerMessage);
      worker.postMessage(meta.board);
    });
  };
  setTimeout(loop, 0);
};
