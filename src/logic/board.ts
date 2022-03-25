export type Board = {
  input: ImageData;
  output: ImageData;

  inSkip: boolean[];
  outSkip: boolean[];
};

export const ALIVE = true;
export const DEAD = false;

export const SKIP = true;
export const DONT_SKIP = false;

export const ALIVE_COLOR = [255, 255, 255, 255] as const;
export const DEAD_COLOR = [0, 0, 0, 255] as const;

export const CELL_COLOR = [DEAD_COLOR, ALIVE_COLOR] as const;

export const SKIP_MULTIPLYER = 2;

export const newBoard = (viewWidth: number, viewHeight: number) => {
  const width = viewWidth + 2;
  const height = viewHeight + 2;

  const newImageData = () => new ImageData(width, height);
  const newSkips = () => Array(getSkipI(width * height)).fill(false);

  const board: Board = {
    input: newImageData(),
    output: newImageData(),
    inSkip: newSkips(),
    outSkip: newSkips(),
  };

  return board;
};

export const setCell = (data: ImageData['data'], i: number, alive: boolean) => {
  const color = CELL_COLOR[alive ? 1 : 0];
  for (let offset = 0; offset < 4; offset++) {
    data[i * 4 + offset] = color[offset];
  }
};

export const setCellFrom = (data: ImageData['data'], i: number, from: number) => {
  return setCell(data, i, getCell(data, from));
};

export const getCell = (data: ImageData['data'], i: number): boolean => {
  return data[i * 4] ? ALIVE : DEAD;
};

export const getSkipI = (i: number) => Math.floor(i / SKIP_MULTIPLYER);

export const setSkip = (skips: boolean[], i: number, value: boolean) => {
  skips[getSkipI(i)] = value;
};

export const getSkip = (skips: boolean[], i: number) => {
  return skips[getSkipI(i)];
};
