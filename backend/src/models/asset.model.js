'use strict';

module.exports = (sequelize, DataTypes) => {

  const Asset = sequelize.define(
    'Asset',
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
      // COMPANY ID
      // MUST MATCH Companies.id
      // =========================
      companyId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,

        field: 'company_id',

        references: {
          model: 'Companies',
          key: 'id',
        },

        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      // =========================
      // ASSET CODE
      // =========================
      assetCode: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,

        field: 'asset_code',
      },

      // =========================
      // ASSET NAME
      // =========================
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      // =========================
      // ASSET TYPE
      // =========================
      type: {
        type: DataTypes.ENUM(
          'laptop',
          'mobile',
          'sim',
          'tablet',
          'monitor',
          'keyboard',
          'mouse',
          'headset',
          'other'
        ),

        allowNull: false,
      },

      // =========================
      // BRAND
      // =========================
      brand: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      // =========================
      // MODEL
      // =========================
      model: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      // =========================
      // SERIAL NUMBER
      // =========================
      serialNumber: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,

        field: 'serial_number',
      },

      // =========================
      // IMEI
      // =========================
      imei: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      // =========================
      // SIM NUMBER
      // =========================
      simNumber: {
        type: DataTypes.STRING(255),
        allowNull: true,

        field: 'sim_number',
      },

      // =========================
      // PURCHASE DATE
      // =========================
      purchaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,

        field: 'purchase_date',
      },

      // =========================
      // PURCHASE PRICE
      // =========================
      purchasePrice: {
        type: DataTypes.FLOAT,
        allowNull: true,

        field: 'purchase_price',
      },

      // =========================
      // WARRANTY EXPIRY
      // =========================
      warrantyExpiry: {
        type: DataTypes.DATEONLY,
        allowNull: true,

        field: 'warranty_expiry',
      },

      // =========================
      // STATUS
      // =========================
      status: {
        type: DataTypes.ENUM(
          'available',
          'assigned',
          'under_repair',
          'retired',
          'lost'
        ),

        allowNull: false,
        defaultValue: 'available',
      },

      // =========================
      // CONDITION
      // =========================
      condition: {
        type: DataTypes.ENUM(
          'new',
          'good',
          'fair',
          'poor'
        ),

        allowNull: false,
        defaultValue: 'good',
      },

      // =========================
      // LOCATION
      // =========================
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      // =========================
      // NOTES
      // =========================
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

    },

    {

      tableName: 'Assets',

      timestamps: true,

      paranoid: true,

      underscored: true,

    }
  );

  return Asset;
};