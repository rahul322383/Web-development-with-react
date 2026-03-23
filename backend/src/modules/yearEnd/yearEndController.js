const asyncHandler = require('../../utils/asyncHandler');
const yearEndService = require('./yearEndService');

const generateSummary = asyncHandler(async (req, res) => {
  const result = await yearEndService.generateYearSummary(req.body.year);
  res.status(200).json({ count: result.length, result });
});

const listSummaries = asyncHandler(async (req, res) => {
  const year = Number(req.query.year || new Date().getFullYear() - 1);
  const result = await yearEndService.getYearSummaries(year);
  res.status(200).json(result);
});

module.exports = {
  generateSummary,
  listSummaries
};