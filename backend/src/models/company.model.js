'use strict';

module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {

    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
      comment: 'URL-safe company identifier e.g. acme-corp',
    },

    email: {
      type: DataTypes.STRING(120),
      allowNull: true,
      comment: 'Official company contact email',
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'phone',
    },

    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    industry: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    size: {
      type: DataTypes.ENUM('1-10', '11-50', '51-200', '201-500', '500+'),
      allowNull: true,
      comment: 'Employee headcount band',
    },

    // ── address ───────────────────────────────────────────────
    addressLine1: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'address_line1',
    },

    addressLine2: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'address_line2',
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'India',
    },

    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'postal_code',
    },

    // ── logo (Cloudinary) ─────────────────────────────────────
    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'logo_url',
    },

    logoPublicId: {
      type: DataTypes.STRING(300),
      allowNull: true,
      field: 'logo_public_id',
      comment: 'Cloudinary public_id — needed for deletion/replacement',
    },

    // ── HR / payroll settings (company-level policy) ──────────
    workingHoursPerDay: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 8.0,
      field: 'working_hours_per_day',
    },

    workingDaysPerWeek: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 5,
      field: 'working_days_per_week',
    },

    annualLeaveQuota: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 21,
      field: 'annual_leave_quota',
      comment: 'Default annual leave days for new employees',
    },

    timezone: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: 'Asia/Kolkata',
    },

    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'INR',
    },

    fiscalYearStart: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 4,
      field: 'fiscal_year_start',
      comment: 'Month number 1-12 (4 = April, Indian FY)',
    },

    // ── status ────────────────────────────────────────────────
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_verified',
      comment: 'Email / domain verified',
    },

    subscriptionPlan: {
      type: DataTypes.ENUM('free', 'starter', 'pro', 'enterprise'),
      allowNull: false,
      defaultValue: 'free',
      field: 'subscription_plan',
    },

    subscriptionExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'subscription_expires_at',
    },

  }, {
    tableName: 'companies',
    underscored: true,
    timestamps: true,
    paranoid: true,          // soft-delete via deleted_at
    indexes: [
      { unique: true, fields: ['slug'] },
      { fields: ['is_active'] },
    ],
  });

  return Company;
};