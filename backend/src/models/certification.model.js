'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Certification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    enrollmentId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'CourseEnrollments', key: 'id' } },
    courseId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Courses', key: 'id' } },
    employeeId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    companyId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'Companies', key: 'id' } },
    certificateNumber: { type: DataTypes.STRING, allowNull: false, unique: true }, // CERT-2025-00042
    issuedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    expiresAt: { type: DataTypes.DATE, allowNull: true },         // null = no expiry
    score: { type: DataTypes.FLOAT, allowNull: true },
    pdfUrl: { type: DataTypes.STRING, allowNull: true },
    verificationCode: { type: DataTypes.STRING, allowNull: true, unique: true }, // public verify link
    isRevoked: { type: DataTypes.BOOLEAN, defaultValue: false },
    revokedAt: { type: DataTypes.DATE, allowNull: true },
    revokedReason: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'Certifications',
    timestamps: true,
  });
};
