// models/index.js — Sequelize initialization & associations

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME     || 'freshkeeper',
  process.env.DB_USER     || 'root',
  process.env.DB_PASSWORD || '',
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps:  true,
      underscored: false,
    }
  }
);

// ── Model imports ──────────────────────────────────────────
const User   = require('./User')(sequelize);
const Item   = require('./Item')(sequelize);
const Recipe = require('./Recipe')(sequelize);
const Tag    = require('./Tag')(sequelize);

// ── Associations ───────────────────────────────────────────
// One-to-many: User has many Items
User.hasMany(Item,  { foreignKey: 'userId', as: 'items' });
Item.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// Many-to-many: Recipe <-> Tag  (junction table: RecipeTags)
Recipe.belongsToMany(Tag,    { through: 'RecipeTags', foreignKey: 'recipeId', as: 'tags' });
Tag.belongsToMany(Recipe, { through: 'RecipeTags', foreignKey: 'tagId',    as: 'recipes' });

module.exports = { sequelize, User, Item, Recipe, Tag };
