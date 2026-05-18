'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Asset', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Companies', key: 'id' },
    },
    assetCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // e.g. 'LPT-0042', 'MOB-0011'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // e.g. 'Dell Latitude 5520'
    },
    type: {
      type: DataTypes.ENUM('laptop', 'mobile', 'sim', 'tablet', 'monitor', 'keyboard', 'mouse', 'headset', 'other'),
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    imei: {
      // for mobiles
      type: DataTypes.STRING,
      allowNull: true,
    },
    simNumber: {
      // for SIM cards
      type: DataTypes.STRING,
      allowNull: true,
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    purchasePrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    warrantyExpiry: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('available', 'assigned', 'under_repair', 'retired', 'lost'),
      defaultValue: 'available',
    },
    condition: {
      type: DataTypes.ENUM('new', 'good', 'fair', 'poor'),
      defaultValue: 'good',
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true, // office location / branch
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'Assets',
    timestamps: true,
    paranoid: true,
  });
};
