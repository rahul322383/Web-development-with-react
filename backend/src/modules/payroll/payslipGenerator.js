'use strict';

/**
 * payslipGenerator.js
 * Converts the HTML payslip template to a PDF buffer using puppeteer.
 *
 * Install: npm install puppeteer
 * (puppeteer downloads Chromium automatically — ~170 MB one-time)
 *
 * Alternative (lighter): npm install puppeteer-core  +  use system Chrome
 */

const puppeteer = require('puppeteer');
const { generatePayslipHTML } = require('./payslipTemplate');
const logger = require('../../config/logger');   // adjust path

/**
 * generatePayslipPDF
 * @param {object} payslipData  — same shape passed to generatePayslipHTML
 * @returns {Buffer}            — PDF binary buffer, ready to stream/save
 */
const generatePayslipPDF = async (payslipData) => {
  const html = generatePayslipHTML(payslipData);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',    // important in Docker / Linux servers
      ],
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format:             'A4',
      printBackground:    true,
      margin: {
        top:    '10mm',
        bottom: '10mm',
        left:   '0mm',
        right:  '0mm',
      },
    });

    return pdfBuffer;

  } catch (err) {
    logger.error({ event: 'PAYSLIP_PDF_FAILED', error: err.message });
    throw err;
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { generatePayslipPDF };
