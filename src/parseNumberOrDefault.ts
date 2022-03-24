export const parseNumberOrDefault = (value: unknown, defaultValue: number) => {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};
