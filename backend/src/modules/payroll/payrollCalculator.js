'use strict'

const PF_RATE = 0.12
const PF_WAGE_CEILING = 15000
const METRO_HRA_RATE = 0.5
const NON_METRO_HRA_RATE = 0.4

const PT_SLABS = [
  { upTo: 7500, tax: 0 },
  { upTo: 10000, tax: 175 },
  { upTo: Infinity, tax: 200 },
]

const NEW_REGIME_SLABS = [
  { upTo: 300000, rate: 0.0 },
  { upTo: 600000, rate: 0.05 },
  { upTo: 900000, rate: 0.1 },
  { upTo: 1200000, rate: 0.15 },
  { upTo: 1500000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
]

const STANDARD_DEDUCTION_NEW = 75000
const HEALTH_EDU_CESS = 0.04

const round2 = (n) => Math.round(Number(n) * 100) / 100
const pct = (base, rate) => round2(Number(base) * rate)

const calcProfessionalTax = (monthlyGross) => {
  const slab = PT_SLABS.find((s) => monthlyGross <= s.upTo)
  return slab ? slab.tax : 200
}

const calcAnnualIncomeTax = (annualTaxableIncome) => {
  const taxable = Math.max(0, annualTaxableIncome - STANDARD_DEDUCTION_NEW)
  if (taxable <= 700000) return 0

  let tax = 0
  let prev = 0

  for (const slab of NEW_REGIME_SLABS) {
    if (taxable <= prev) break
    const slice = Math.min(taxable, slab.upTo) - prev
    tax += pct(slice, slab.rate)
    prev = slab.upTo
    if (slab.upTo === Infinity) break
  }

  const cess = pct(tax, HEALTH_EDU_CESS)
  return round2(tax + cess)
}

const computeSalaryBreakdown = ({
  ctc,
  bonus = 0,
  otMinutes = 0,
  isMetro = true,
}) => {
  const annualCTC = Number(ctc)
  const monthlyCTC = round2(annualCTC / 12)

  const basic = round2(monthlyCTC * 0.4)
  const hraRate = isMetro ? METRO_HRA_RATE : NON_METRO_HRA_RATE
  const hra = pct(basic, hraRate)

  const pfBase = Math.min(basic, PF_WAGE_CEILING)
  const pfEmployer = pct(pfBase, PF_RATE)
  const pfEmployee = pct(pfBase, PF_RATE)

  const specialAllowance = round2(monthlyCTC - basic - hra - pfEmployer)

  const hourlyRate = round2(basic / (22 * 9))
  const otHours = round2(otMinutes / 60)
  const otAmount = round2(hourlyRate * otHours * 1.5)

  const grossEarnings = round2(
    basic + hra + specialAllowance + Number(bonus) + otAmount
  )

  const professionalTax = calcProfessionalTax(grossEarnings)

  const annualGross = grossEarnings * 12
  const annualIncomeTax = calcAnnualIncomeTax(annualGross)
  const tds = round2(annualIncomeTax / 12)

  const totalDeductions = round2(pfEmployee + professionalTax + tds)
  const netSalary = round2(grossEarnings - totalDeductions)

  return {
    basic,
    hra,
    specialAllowance,
    bonus: round2(Number(bonus)),
    overtimePay: otAmount,
    grossEarnings,
    pfEmployee,
    pfEmployer,
    professionalTax,
    tds,
    totalDeductions,
    netSalary,
    ctcMonthly: monthlyCTC,
    ctcAnnual: annualCTC,
    annualIncomeTax,
    otHours,
    isMetro,
  }
}

const computeNetSalary = ({ baseSalary = 0, bonus = 0, deductions = 0 }) =>
  round2(Number(baseSalary) + Number(bonus) - Number(deductions))

module.exports = {
  computeSalaryBreakdown,
  computeNetSalary,
  calcAnnualIncomeTax,
  calcProfessionalTax,
  round2,
}