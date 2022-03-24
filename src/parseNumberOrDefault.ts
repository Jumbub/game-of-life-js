export const parseNumberOrDefault = (value: unknown, defaultValue: number) => {
  const parsed = value ? Number(value) : NaN;
  return isNaN(parsed) ? defaultValue : parsed;
};
