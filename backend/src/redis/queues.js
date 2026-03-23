const { Queue } = require('bullmq');
const { redisConnectionOptions } = require('./redisClient');

const queueDefaults = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000
  },
  removeOnComplete: 100,
  removeOnFail: 500
};

const payrollQueue = new Queue('payroll-processing', {
  connection: redisConnectionOptions,
  defaultJobOptions: queueDefaults
});

const leaveResetQueue = new Queue('leave-reset', {
  connection: redisConnectionOptions,
  defaultJobOptions: queueDefaults
});

const yearEndQueue = new Queue('year-end-summary', {
  connection: redisConnectionOptions,
  defaultJobOptions: queueDefaults
});

module.exports = {
  payrollQueue,
  leaveResetQueue,
  yearEndQueue
};