export const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.backgroundColor = 'black';
  document.body.append(canvas);
  canvas.getContext('2d')?.clearRect(0, 0, width, height);
  return canvas;
};
