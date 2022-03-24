export const createNonDeterministicBenchmark = (width: number, height: number) =>
  Array((width + 2) * (height + 2))
    .fill(0)
    .map((_, i) => {
      const x = i % width;
      const y = Math.floor(i / width);

      return Math.random() > 0.5 ? '1' : '0';

      // if (y > height / 2) {
      //   if (x < width / 2) return Math.random() > 0.5 ? '1' : '0';
      //   else return (x / 8) % 2 != (y / 8) % 2 ? '1' : '0';
      // } else {
      //   return '0'; // todo
      // }
    })
    .join('');
