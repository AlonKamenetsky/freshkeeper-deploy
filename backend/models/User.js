// models/User.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    userId: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    firstName: {
      type:      DataTypes.STRING(60),
      allowNull: false,
    },
    lastName: {
      type:      DataTypes.STRING(60),
      allowNull: false,
    },
    email: {
      type:      DataTypes.STRING(120),
      allowNull: false,
      unique:    true,
      validate:  { isEmail: true },
    },
    password: {
      type:      DataTypes.STRING(255),
      allowNull: false,
    },
    userRole: {
      type:         DataTypes.ENUM('admin', 'employee', 'consumer'),
      allowNull:    false,
      defaultValue: 'consumer',
    },
  }, {
    tableName: 'Users',
  });

  return User;
};
