const log = (action, data = {}) => {
  const logEntry = {
    action,
    timestamp: new Date().toISOString(),
    ...data
  };
  console.log(JSON.stringify(logEntry));
};

const logError = (action, error, data = {}) => {
  const logEntry = {
    action,
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    ...data
  };
  console.error(JSON.stringify(logEntry));
};

module.exports = {
  log,
  logError
};
