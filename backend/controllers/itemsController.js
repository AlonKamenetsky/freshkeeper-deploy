// controllers/itemsController.js — Sequelize version
const { Item, User }   = require('../models');
const { Op }           = require('sequelize');
const { successResponse, errorResponse } = require('../middleware/response');

const VALID_STORAGE = ['fridge', 'freezer', 'pantry'];
const VALID_CATS    = ['dairy', 'meat', 'vegetables', 'fruits', 'grains', 'other'];

// GET /items
async function getAllItems(req, res) {
  try {
    const where = {};
    if (req.query.storageType) where.storageType = req.query.storageType;
    if (req.query.category)    where.category    = req.query.category;
    if (req.query.expiringSoon === 'true') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + 3);
      where.expirationDate = { [Op.lte]: cutoff };
    }
    const userId = req.headers['x-user-id'];
    if (userId) {
      where.userId = parseInt(userId);
    }
    const items = await Item.findAll({
      where,
      include: [{ association: 'owner', attributes: ['userId', 'firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']],
    });
    return successResponse(res, items);
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// GET /items/:id
async function getItemById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid item ID.', {});
  try {
    const item = await Item.findByPk(id, {
      include: [{ association: 'owner', attributes: ['userId', 'firstName', 'lastName'] }]
    });
    if (!item) return errorResponse(res, 404, 'NOT_FOUND', `Item ${id} not found.`, {});
    return successResponse(res, item);
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// POST /items
async function createItem(req, res) {
  const { name, quantity, unit, expirationDate, storageType, category } = req.body;
  const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
  if (!name || quantity === undefined)
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'name and quantity are required.', {});
  if (typeof quantity !== 'number' || quantity < 0)
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'quantity must be a non-negative number.', {});
  if (storageType && !VALID_STORAGE.includes(storageType))
    return errorResponse(res, 400, 'VALIDATION_ERROR', `Invalid storageType. Allowed: ${VALID_STORAGE.join(', ')}.`, {});
  if (category && !VALID_CATS.includes(category))
    return errorResponse(res, 400, 'VALIDATION_ERROR', `Invalid category. Allowed: ${VALID_CATS.join(', ')}.`, {});
  try {
    const item = await Item.create({ name, quantity, unit, expirationDate, storageType, category, userId });
    const io = req.app.get('io');
    if (io && userId) io.to(`user_${userId}`).emit('item:created', { itemId: item.itemId, name: item.name, category: item.category, storageType: item.storageType });
    return successResponse(res, { itemId: item.itemId }, 201);
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// PUT /items/:id
async function updateItem(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid item ID.', {});
  const { name, quantity, unit, expirationDate, storageType, category } = req.body;
  const requestingUserId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
  const userRole = req.headers['x-user-role'];
  if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0))
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'quantity must be a non-negative number.', {});
  if (storageType && !VALID_STORAGE.includes(storageType))
    return errorResponse(res, 400, 'VALIDATION_ERROR', `Invalid storageType.`, {});
  if (category && !VALID_CATS.includes(category))
    return errorResponse(res, 400, 'VALIDATION_ERROR', `Invalid category.`, {});
  try {
    const item = await Item.findByPk(id);
    if (!item) return errorResponse(res, 404, 'NOT_FOUND', `Item ${id} not found.`, {});
    if (userRole !== 'admin' && item.userId !== null && item.userId !== requestingUserId)
      return errorResponse(res, 403, 'FORBIDDEN', 'You can only delete your own items.', {});
    await item.update({ name, quantity, unit, expirationDate, storageType, category });
    const io = req.app.get('io');
    if (io && item.userId) io.to(`user_${item.userId}`).emit('item:updated', { itemId: item.itemId, name: item.name, quantity: item.quantity });
    return successResponse(res, { itemId: item.itemId });
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// DELETE /items/:id
async function deleteItem(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid item ID.', {});
  const requestingUserId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
  const userRole = req.headers['x-user-role'];
  try {
    const item = await Item.findByPk(id);
    if (!item) return errorResponse(res, 404, 'NOT_FOUND', `Item ${id} not found.`, {});
    if (userRole !== 'admin' && item.userId !== null && item.userId !== requestingUserId)
      return errorResponse(res, 403, 'FORBIDDEN', 'You can only delete your own items.', {});
    await item.destroy();
    const io = req.app.get('io');
    if (io && item.userId) io.to(`user_${item.userId}`).emit('item:deleted', { itemId: id });
    return successResponse(res, { itemId: id });
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem };