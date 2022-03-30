export const newContext = (viewWidth: number, viewHeight: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = viewWidth + 2;
  canvas.height = viewHeight + 2;
  canvas.style.backgroundColor = 'black';
  canvas.style.position = 'fixed';
  canvas.style.left = '-1px';
  canvas.style.top = '-1px';
  canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  document.body.append(canvas);

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Must be able to retrieve 2d context');

  return { canvas, context };
};
