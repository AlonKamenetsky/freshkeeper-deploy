// models/Tag.js — junction side for Recipe <-> Tags many-to-many
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tag = sequelize.define('Tag', {
    tagId: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    name: {
      type:      DataTypes.STRING(60),
      allowNull: false,
      unique:    true,
    },
  }, {
    tableName: 'Tags',
  });

  return Tag;
};
