// models/Item.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Item = sequelize.define('Item', {
    itemId: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    name: {
      type:      DataTypes.STRING(120),
      allowNull: false,
    },
    quantity: {
      type:      DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    unit: {
      type:         DataTypes.STRING(30),
      defaultValue: 'units',
    },
    expirationDate: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
    },
    storageType: {
      type:         DataTypes.ENUM('fridge', 'freezer', 'pantry'),
      defaultValue: 'pantry',
    },
    category: {
      type:         DataTypes.ENUM('dairy', 'meat', 'vegetables', 'fruits', 'grains', 'other'),
      defaultValue: 'other',
    },
    userId: {
      type:      DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'userId' },
    },
  }, {
    tableName: 'Items',
  });

  return Item;
};
