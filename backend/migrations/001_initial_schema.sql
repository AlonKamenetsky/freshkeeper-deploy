-- migrations/001_initial_schema.sql
-- Run once to create the FreshKeeper database and tables.
-- Sequelize sync({ alter: true }) will also handle this automatically on server start.

CREATE DATABASE IF NOT EXISTS freshkeeper
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE freshkeeper;

CREATE TABLE IF NOT EXISTS Users (
  userId      INT          NOT NULL AUTO_INCREMENT,
  firstName   VARCHAR(60)  NOT NULL,
  lastName    VARCHAR(60)  NOT NULL,
  email       VARCHAR(120) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  userRole    ENUM('admin','employee','consumer') NOT NULL DEFAULT 'consumer',
  createdAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (userId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Items (
  itemId         INT         NOT NULL AUTO_INCREMENT,
  name           VARCHAR(120) NOT NULL,
  quantity       FLOAT        NOT NULL DEFAULT 0,
  unit           VARCHAR(30)  NOT NULL DEFAULT 'units',
  expirationDate DATE,
  storageType    ENUM('fridge','freezer','pantry') NOT NULL DEFAULT 'pantry',
  category       ENUM('dairy','meat','vegetables','fruits','grains','other') NOT NULL DEFAULT 'other',
  userId         INT,
  createdAt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (itemId),
  FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Recipes (
  recipeId     INT      NOT NULL AUTO_INCREMENT,
  name         VARCHAR(120) NOT NULL,
  ingredients  JSON     NOT NULL,
  instructions TEXT     NOT NULL,
  prepTime     INT      NOT NULL DEFAULT 0,
  cookTime     INT      NOT NULL DEFAULT 0,
  servings     INT      NOT NULL DEFAULT 1,
  createdAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (recipeId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Tags (
  tagId     INT         NOT NULL AUTO_INCREMENT,
  name      VARCHAR(60) NOT NULL UNIQUE,
  createdAt DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (tagId)
) ENGINE=InnoDB;

-- Junction table for Recipe <-> Tags (many-to-many)
CREATE TABLE IF NOT EXISTS RecipeTags (
  recipeId INT NOT NULL,
  tagId    INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (recipeId, tagId),
  FOREIGN KEY (recipeId) REFERENCES Recipes(recipeId) ON DELETE CASCADE,
  FOREIGN KEY (tagId)    REFERENCES Tags(tagId)        ON DELETE CASCADE
) ENGINE=InnoDB;
