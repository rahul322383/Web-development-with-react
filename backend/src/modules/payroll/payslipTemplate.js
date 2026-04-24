'use strict';

/**
 * payslipTemplate.js
 * Generates a professional HTML payslip string.
 * Converted to PDF by payslipGenerator.js using puppeteer.
 */

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
    .format(Number(n) || 0);

const monthName = (m) =>
  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m) - 1] || m;

/**
 * generatePayslipHTML
 * @param {object} p  - payslip data
 */
const generatePayslipHTML = (p) => {
  const {
    // Company
    companyName     = 'Acme Corp Pvt. Ltd.',
    companyAddress  = '123 Business Park, Mumbai, Maharashtra 400001',
    companyEmail    = 'hr@acmecorp.com',

    // Employee
    employeeCode,
    employeeName,
    designation     = '',
    department      = '',
    email           = '',
    joiningDate     = '',
    bankAccount     = 'XXXX-XXXX-XXXX',
    panNumber       = 'XXXXX0000X',
    pfNumber        = '',
    isMetro         = true,

    // Period
    month,
    year,
    paymentDate,
    workingDays     = 26,
    presentDays     = 26,
    leaveDays       = 0,
    lopDays         = 0,

    // Earnings
    basic,
    hra,
    specialAllowance,
    bonus           = 0,
    overtimePay     = 0,
    grossEarnings,

    // Deductions
    pfEmployee,
    pfEmployer,
    professionalTax,
    tds,
    totalDeductions,

    // Net
    netSalary,
    ctcAnnual,
    ctcMonthly,

    // Status
    status          = 'Processed',
  } = p;

  const period = `${monthName(month)} ${year}`;

  const earningsRows = [
    { label: 'Basic Salary',       amount: basic           },
    { label: 'House Rent Allowance (HRA)', amount: hra     },
    { label: 'Special Allowance',  amount: specialAllowance },
    bonus > 0      ? { label: 'Performance Bonus', amount: bonus      } : null,
    overtimePay > 0? { label: 'Overtime Pay',      amount: overtimePay} : null,
  ].filter(Boolean);

  const deductionRows = [
    { label: 'PF (Employee 12%)',  amount: pfEmployee      },
    { label: 'Professional Tax',   amount: professionalTax },
    { label: 'Income Tax (TDS)',   amount: tds             },
  ].filter(r => r.amount > 0);

  const earningsHTML  = earningsRows.map(r =>
    `<tr><td>${r.label}</td><td class="amount">${fmt(r.amount)}</td></tr>`
  ).join('');

  const deductionsHTML = deductionRows.map(r =>
    `<tr><td>${r.label}</td><td class="amount">${fmt(r.amount)}</td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Payslip – ${period}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #1a1a1a; background: #fff; }
  .page { width: 210mm; min-height: 297mm; padding: 14mm 16mm; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e3a5f; padding-bottom: 12px; margin-bottom: 14px; }
  .company-name { font-size: 20px; font-weight: 700; color: #1e3a5f; }
  .company-sub  { font-size: 10px; color: #555; margin-top: 3px; }
  .payslip-badge { background: #1e3a5f; color: #fff; padding: 6px 16px; border-radius: 4px; font-size: 13px; font-weight: 600; text-align: center; }
  .payslip-badge small { display: block; font-size: 10px; font-weight: 400; margin-top: 2px; }

  /* Employee info grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #d0d7de; border-radius: 6px; overflow: hidden; margin-bottom: 16px; }
  .info-grid .section-title { grid-column: 1 / -1; background: #f0f4f8; padding: 6px 12px; font-weight: 600; font-size: 11px; color: #1e3a5f; border-bottom: 1px solid #d0d7de; text-transform: uppercase; letter-spacing: .04em; }
  .info-row { display: flex; padding: 5px 12px; border-bottom: 1px solid #edf0f3; }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #666; min-width: 130px; font-size: 11px; }
  .info-value { font-weight: 500; font-size: 11px; }

  /* Attendance strip */
  .attendance { display: grid; grid-template-columns: repeat(4, 1fr); background: #f0f4f8; border: 1px solid #d0d7de; border-radius: 6px; margin-bottom: 16px; overflow: hidden; }
  .att-cell { padding: 10px; text-align: center; border-right: 1px solid #d0d7de; }
  .att-cell:last-child { border-right: none; }
  .att-num  { font-size: 20px; font-weight: 700; color: #1e3a5f; }
  .att-label{ font-size: 10px; color: #666; margin-top: 2px; }

  /* Salary table */
  .salary-section { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .salary-box { border: 1px solid #d0d7de; border-radius: 6px; overflow: hidden; }
  .salary-box-title { background: #1e3a5f; color: #fff; padding: 7px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
  .salary-box table { width: 100%; border-collapse: collapse; }
  .salary-box td { padding: 6px 12px; border-bottom: 1px solid #edf0f3; font-size: 11.5px; }
  .salary-box tr:last-child td { border-bottom: none; }
  .salary-box .amount { text-align: right; font-weight: 500; }
  .salary-box .total-row td { background: #f0f4f8; font-weight: 700; font-size: 12px; border-top: 2px solid #d0d7de; }

  /* Net salary banner */
  .net-banner { background: #1e3a5f; color: #fff; border-radius: 6px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .net-label  { font-size: 14px; font-weight: 600; }
  .net-amount { font-size: 24px; font-weight: 700; }
  .net-sub    { font-size: 10px; opacity: .7; margin-top: 2px; }

  /* PF info */
  .pf-note { background: #fffbf0; border: 1px solid #f0c050; border-radius: 6px; padding: 8px 14px; font-size: 11px; color: #7a5000; margin-bottom: 16px; }

  /* Footer */
  .footer { border-top: 1px solid #d0d7de; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-note { font-size: 10px; color: #888; }
  .stamp { text-align: right; font-size: 11px; color: #1e3a5f; }
  .stamp .sig-line { width: 140px; border-top: 1px solid #333; margin: 28px 0 4px auto; }

  .status-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 10px; font-weight: 600;
    background: ${status === 'Locked' ? '#d4edda' : '#fff3cd'};
    color:      ${status === 'Locked' ? '#155724' : '#856404'}; }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-name">${companyName}</div>
      <div class="company-sub">${companyAddress}</div>
      <div class="company-sub">${companyEmail}</div>
    </div>
    <div class="payslip-badge">
      PAY SLIP
      <small>${period}</small>
    </div>
  </div>

  <!-- Employee Info -->
  <div class="info-grid">
    <div class="section-title">Employee Details</div>

    <div>
      <div class="info-row"><span class="info-label">Employee Code</span><span class="info-value">${employeeCode || '—'}</span></div>
      <div class="info-row"><span class="info-label">Employee Name</span><span class="info-value">${employeeName}</span></div>
      <div class="info-row"><span class="info-label">Designation</span><span class="info-value">${designation || '—'}</span></div>
      <div class="info-row"><span class="info-label">Department</span><span class="info-value">${department || '—'}</span></div>
    </div>
    <div>
      <div class="info-row"><span class="info-label">Date of Joining</span><span class="info-value">${joiningDate || '—'}</span></div>
      <div class="info-row"><span class="info-label">Bank Account</span><span class="info-value">${bankAccount}</span></div>
      <div class="info-row"><span class="info-label">PAN Number</span><span class="info-value">${panNumber}</span></div>
      <div class="info-row"><span class="info-label">PF Number</span><span class="info-value">${pfNumber || '—'}</span></div>
    </div>
  </div>

  <!-- Attendance -->
  <div class="attendance">
    <div class="att-cell"><div class="att-num">${workingDays}</div><div class="att-label">Working Days</div></div>
    <div class="att-cell"><div class="att-num">${presentDays}</div><div class="att-label">Days Present</div></div>
    <div class="att-cell"><div class="att-num">${leaveDays}</div><div class="att-label">Leave Days</div></div>
    <div class="att-cell"><div class="att-num" style="color:#c0392b">${lopDays}</div><div class="att-label">LOP Days</div></div>
  </div>

  <!-- Salary Table -->
  <div class="salary-section">
    <div class="salary-box">
      <div class="salary-box-title">Earnings</div>
      <table>
        ${earningsHTML}
        <tr class="total-row"><td>Gross Earnings</td><td class="amount">${fmt(grossEarnings)}</td></tr>
      </table>
    </div>
    <div class="salary-box">
      <div class="salary-box-title">Deductions</div>
      <table>
        ${deductionsHTML}
        <tr class="total-row"><td>Total Deductions</td><td class="amount">${fmt(totalDeductions)}</td></tr>
      </table>
    </div>
  </div>

  <!-- Net Salary Banner -->
  <div class="net-banner">
    <div>
      <div class="net-label">Net Salary (Take Home)</div>
      <div class="net-sub">${period} &nbsp;·&nbsp; <span class="status-badge">${status}</span></div>
    </div>
    <div class="net-amount">${fmt(netSalary)}</div>
  </div>

  <!-- PF Note -->
  <div class="pf-note">
    Employer PF contribution of ${fmt(p.pfEmployer || 0)} per month is part of your CTC but not included in take-home.
    Annual CTC: ${fmt(ctcAnnual)} &nbsp;|&nbsp; Monthly CTC: ${fmt(ctcMonthly)}
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>
      <div class="footer-note">This is a computer-generated payslip and does not require a signature.</div>
      <div class="footer-note">Generated on ${new Date().toLocaleDateString('en-IN')}</div>
    </div>
    <div class="stamp">
      <div class="sig-line"></div>
      <div>Authorized Signatory</div>
      <div style="color:#888;font-size:10px">${companyName}</div>
    </div>
  </div>

</div>
</body>
</html>`;
};

module.exports = { generatePayslipHTML };
