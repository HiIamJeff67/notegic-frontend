import { SQLiteOpfsDriver, SQLocalProcessor } from "sqlocal";

const processor = new SQLocalProcessor(new SQLiteOpfsDriver());
const workerScope = self as typeof self & {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

self.onmessage = message => {
  void processor.postMessage(message);
};

processor.onmessage = (message, transfer) => {
  workerScope.postMessage(message, transfer);
};
