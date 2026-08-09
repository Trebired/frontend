let logsPartialManager: any = null;
const frontendLogsBuffer: any[] = [];

function setLogsPartialManager(manager: any) {
  logsPartialManager = manager && typeof manager === "object" ? manager : null;
}

function pushFrontendLogBatch(batch: any) {
  if (
    logsPartialManager &&
    typeof logsPartialManager.ingestFrontendLogs === "function"
  ) {
    logsPartialManager.ingestFrontendLogs(batch);
    return;
  }
  frontendLogsBuffer.push(batch);
}

function bufferFrontendLogBatch(batch: any) {
  frontendLogsBuffer.push(batch);
}

function flushBufferedFrontendLogs(
  ingestFrontendLogs: (input: any) => boolean,
) {
  const pending = frontendLogsBuffer.splice(0, frontendLogsBuffer.length);
  let consumed = 0;

  pending.forEach(function (item) {
    if (ingestFrontendLogs(item)) {
      consumed += 1;
      return;
    }
    frontendLogsBuffer.push(item);
  });

  return consumed;
}

export {
  bufferFrontendLogBatch,
  flushBufferedFrontendLogs,
  pushFrontendLogBatch,
  setLogsPartialManager,
};
