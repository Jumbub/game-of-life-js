export const createNonDeterministicBenchmark = (width: number, height: number) =>
  Array((width + 2) * (height + 2))
    .fill(0)
    .map((_, i) => {
      const x = i % width;
      const y = Math.floor(i / width);
      return Math.random() > 0.5 ? '1' : '0';
    })
    .join('');
