'use strict';

module.exports = (sequelize, DataTypes) => {

  const Certification = sequelize.define(
    'Certification',
    {

      // =========================
      // PRIMARY KEY
      // =========================
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // =========================
      // ENROLLMENT ID
      // =========================
      enrollmentId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        field: 'enrollment_id',

        references: {
          model: 'CourseEnrollments',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      // =========================
      // COURSE ID
      // =========================
      courseId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        field: 'course_id',

        references: {
          model: 'Courses',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      // =========================
      // EMPLOYEE ID
      // =========================
      employeeId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        field: 'employee_id',

        references: {
          model: 'users',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      // =========================
      // COMPANY ID
      // =========================
      companyId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,

        field: 'company_id',

        references: {
          model: 'Companies',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      // =========================
      // CERTIFICATE NUMBER
      // =========================
      certificateNumber: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,

        field: 'certificate_number',
      },

      // =========================
      // ISSUED AT
      // =========================
      issuedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,

        field: 'issued_at',
      },

      // =========================
      // EXPIRES AT
      // =========================
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'expires_at',
      },

      // =========================
      // SCORE
      // =========================
      score: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      // =========================
      // PDF URL
      // =========================
      pdfUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,

        field: 'pdf_url',
      },

      // =========================
      // VERIFICATION CODE
      // =========================
      verificationCode: {
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: true,

        field: 'verification_code',
      },

      // =========================
      // REVOCATION
      // =========================
      isRevoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,

        field: 'is_revoked',
      },

      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'revoked_at',
      },

      revokedReason: {
        type: DataTypes.TEXT,
        allowNull: true,

        field: 'revoked_reason',
      },

    },

    {

      tableName: 'Certifications',

      underscored: true,

      timestamps: true,

      paranoid: false,

      indexes: [
        {
          fields: ['certificate_number'],
          unique: true,
        },
        {
          fields: ['verification_code'],
          unique: true,
        },
        {
          fields: ['employee_id'],
        },
        {
          fields: ['course_id'],
        },
        {
          fields: ['enrollment_id'],
        },
        {
          fields: ['company_id'],
        },
      ],

    }
  );

  return Certification;
};