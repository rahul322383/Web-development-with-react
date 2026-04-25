'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const yearEndService = require('./yearEndService');

const generateSummary = asyncHandler(async (req, res) => {
  const result = await yearEndService.generateYearSummary({
    year: req.body.year,
    actor: req.user                     
  });
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const listSummaries = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear() - 1;
  const result = await yearEndService.getYearSummaries({
    year,
    actor: req.user                    
  });
 
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

module.exports = {
  generateSummary,
  listSummaries,
};