const READY = 'worker-ready';

export const notifyReady = () => {
  postMessage(READY);
};

export const waitForReady = async (worker: Worker) =>
  new Promise<Worker>(
    resolve =>
      (worker.onmessage = ({ data: status }: MessageEvent<typeof READY>) => {
        if (status === READY) resolve(worker);
      }),
  );
