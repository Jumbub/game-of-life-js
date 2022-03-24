export type Board = {
  input: ImageData;
  output: ImageData;

  inSkip: boolean[];
  outSkip: boolean[];
};

export const ALIVE = true;
export const DEAD = false;

export const ALIVE_COLOR = [255, 255, 255, 255] as const;
export const DEAD_COLOR = [0, 0, 0, 255] as const;

export const CELL_COLOR = [DEAD_COLOR, ALIVE_COLOR] as const;

export const newBoard = (viewWidth: number, viewHeight: number) => {
  const width = viewWidth + 2;
  const height = viewHeight + 2;

  const board: Board = {
    input: new ImageData(width, height),
    output: new ImageData(width, height),

    inSkip: Array(width * height).fill(false),
    outSkip: Array(width * height).fill(false),
  };

  return board;
};
