// models/Recipe.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Recipe = sequelize.define('Recipe', {
    recipeId: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    name: {
      type:      DataTypes.STRING(120),
      allowNull: false,
    },
    // stored as JSON array of strings
    ingredients: {
      type:      DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    instructions: {
      type:      DataTypes.TEXT,
      allowNull: false,
    },
    prepTime: {
      type:         DataTypes.INTEGER,
      defaultValue: 0,
    },
    cookTime: {
      type:         DataTypes.INTEGER,
      defaultValue: 0,
    },
    servings: {
      type:         DataTypes.INTEGER,
      defaultValue: 1,
    },
  }, {
    tableName: 'Recipes',
  });

  return Recipe;
};
