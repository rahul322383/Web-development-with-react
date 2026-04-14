


const { Worker } = require('bullmq');
const logger = console;
const { redisConnectionOptions } = require('./src/redis/redisClient');

const processPayrollJob = require('./src/jobs/payrollProcessor.job');
const processLeaveResetJob = require('./src/jobs/leaveReset.job');
const processYearEndJob = require('./src/jobs/yearEnd.job');

const workers = [];

// 🔧 Worker Factory
const buildWorker = (queueName, processor) => {
  const worker = new Worker(queueName, processor, {
    connection: redisConnectionOptions,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.log(`✅ ${queueName} job completed: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`❌ ${queueName} job failed: ${job?.id}`, err.message);
  });

  worker.on('stalled', (jobId) => {
    logger.warn(`⚠️ ${queueName} job stalled: ${jobId}`);
  });

  workers.push(worker);
  return worker;
};

// 🚀 Initialize Workers
buildWorker('payroll-processing', processPayrollJob);
buildWorker('leave-reset', processLeaveResetJob);
buildWorker('year-end-summary', processYearEndJob);

console.log('🔥 Workers started');

// 🛑 Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down workers...');
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
});