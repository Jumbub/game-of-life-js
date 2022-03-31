enum Index {
  JOB_COUNT,
  NEXT_JOB,
}

export type JobSignals = Int32Array;

export const createJobSignals = (jobCount: number) => {
  const signals = new Int32Array(new SharedArrayBuffer(4 * 5));
  Atomics.store(signals, Index.JOB_COUNT, jobCount);
  Atomics.store(signals, Index.NEXT_JOB, jobCount);
  return signals;
};

export const notifyStartJobs = (signals: JobSignals) => {
  Atomics.store(signals, Index.NEXT_JOB, 0);
};

export const requestJobToProcess = (signals: JobSignals, lambda: (i: number) => void) => {
  const jobI = Atomics.add(signals, Index.NEXT_JOB, 1);

  if (jobI < signals[Index.JOB_COUNT]) {
    lambda(jobI);
    return true;
  }
  return false;
};
