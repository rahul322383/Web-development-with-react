'use strict';

/**
 * payrollCalculator.js
 * Pure functions — no DB, no side-effects.
 * All amounts in INR (Indian Rupee). Extend easily for other locales.
 *
 * Salary structure:
 *   Basic        = 40% of CTC
 *   HRA          = 50% of Basic (metro) / 40% of Basic (non-metro)
 *   Special Allow= CTC - Basic - HRA - PF_Employer - PT
 *
 * Deductions:
 *   PF (Employee) = 12% of Basic (capped at ₹1,800/month if basic > 15,000)
 *   PT            = Professional Tax slab (state-level, Maharashtra used here)
 *   TDS           = Monthly income-tax advance (new regime FY2024-25)
 */

// ─── Constants ────────────────────────────────────────────────────────────────
const PF_RATE            = 0.12;
const PF_WAGE_CEILING    = 15000;   // PF calculated on basic up to this amount
const METRO_HRA_RATE     = 0.50;
const NON_METRO_HRA_RATE = 0.40;

// Professional Tax slabs (Maharashtra — monthly gross)
const PT_SLABS = [
  { upTo: 7500,  tax: 0    },
  { upTo: 10000, tax: 175  },
  { upTo: Infinity, tax: 200 },   // ₹300 in Feb, but 200 for simplicity
];

// New Tax Regime slabs FY 2024-25 (annual income)
const NEW_REGIME_SLABS = [
  { upTo: 300000,   rate: 0.00 },
  { upTo: 600000,   rate: 0.05 },
  { upTo: 900000,   rate: 0.10 },
  { upTo: 1200000,  rate: 0.15 },
  { upTo: 1500000,  rate: 0.20 },
  { upTo: Infinity, rate: 0.30 },
];

const STANDARD_DEDUCTION_NEW = 75000;   // FY2024-25 new regime
const HEALTH_EDU_CESS         = 0.04;   // 4% on income tax

// ─── Helpers ─────────────────────────────────────────────────────────────────
const round2 = (n) => Math.round(Number(n) * 100) / 100;
const pct    = (base, rate) => round2(Number(base) * rate);

// ─── Professional Tax ─────────────────────────────────────────────────────────
const calcProfessionalTax = (monthlyGross) => {
  const slab = PT_SLABS.find(s => monthlyGross <= s.upTo);
  return slab ? slab.tax : 200;
};

// ─── Annual Income Tax (New Regime) ──────────────────────────────────────────
const calcAnnualIncomeTax = (annualTaxableIncome) => {
  const taxable = Math.max(0, annualTaxableIncome - STANDARD_DEDUCTION_NEW);
  if (taxable <= 700000) return 0;   // rebate u/s 87A for new regime

  let tax = 0;
  let prev = 0;
  for (const slab of NEW_REGIME_SLABS) {
    if (taxable <= prev) break;
    const slice = Math.min(taxable, slab.upTo) - prev;
    tax  += pct(slice, slab.rate);
    prev  = slab.upTo;
    if (slab.upTo === Infinity) break;
  }

  const cess = pct(tax, HEALTH_EDU_CESS);
  return round2(tax + cess);
};

// ─── Main Salary Breakdown ────────────────────────────────────────────────────
/**
 * computeSalaryBreakdown
 * @param {object} params
 * @param {number} params.ctc            Annual CTC (Cost to Company) in INR
 * @param {number} [params.bonus]        One-time / monthly bonus override (monthly)
 * @param {number} [params.otMinutes]    Overtime minutes this month
 * @param {boolean} [params.isMetro]     Metro city? (affects HRA)
 * @returns {SalaryBreakdown}
 */
const computeSalaryBreakdown = ({
  ctc,
  bonus         = 0,
  otMinutes     = 0,
  isMetro       = true,
}) => {
  const annualCTC  = Number(ctc);
  const monthlyCTC = round2(annualCTC / 12);

  // ── Earnings ──────────────────────────────────────────────────────────────
  const basic          = round2(monthlyCTC * 0.40);
  const hraRate        = isMetro ? METRO_HRA_RATE : NON_METRO_HRA_RATE;
  const hra            = pct(basic, hraRate);

  // PF employer contribution (not in-hand but part of CTC)
  const pfBase         = Math.min(basic, PF_WAGE_CEILING);
  const pfEmployer     = pct(pfBase, PF_RATE);
  const pfEmployee     = pct(pfBase, PF_RATE);   // same rate, employee share

  // Special allowance fills the gap
  const specialAllowance = round2(monthlyCTC - basic - hra - pfEmployer);

  // Overtime pay (1.5× per hour, calculated on basic)
  const hourlyRate   = round2(basic / (22 * 9));   // 22 working days × 9 hrs
  const otHours      = round2(otMinutes / 60);
  const otAmount     = round2(hourlyRate * otHours * 1.5);

  const grossEarnings = round2(basic + hra + specialAllowance + Number(bonus) + otAmount);

  // ── Deductions ────────────────────────────────────────────────────────────
  const professionalTax = calcProfessionalTax(grossEarnings);

  // Annual taxable = gross × 12 (simplified; no 80C etc. in new regime)
  const annualGross      = grossEarnings * 12;
  const annualIncomeTax  = calcAnnualIncomeTax(annualGross);
  const tds              = round2(annualIncomeTax / 12);   // monthly TDS advance

  const totalDeductions  = round2(pfEmployee + professionalTax + tds);
  const netSalary        = round2(grossEarnings - totalDeductions);

  return {
    // Earnings
    basic,
    hra,
    specialAllowance,
    bonus:           round2(Number(bonus)),
    overtimePay:     otAmount,
    grossEarnings,

    // Deductions
    pfEmployee,
    pfEmployer,          // shown on payslip, not deducted from in-hand
    professionalTax,
    tds,
    totalDeductions,

    // Net
    netSalary,

    // Meta
    ctcMonthly:  monthlyCTC,
    ctcAnnual:   annualCTC,
    annualIncomeTax,
    otHours,
    isMetro,
  };
};

/**
 * computeNetSalary — backward-compatible shim used by existing payrollService.js
 */
const computeNetSalary = ({ baseSalary = 0, bonus = 0, deductions = 0 }) =>
  round2(Number(baseSalary) + Number(bonus) - Number(deductions));

module.exports = {
  computeSalaryBreakdown,
  computeNetSalary,
  calcAnnualIncomeTax,
  calcProfessionalTax,
  round2,
};
