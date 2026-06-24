// controllers/usersController.js — Sequelize version
const { User, Item }   = require('../models');
const { successResponse, errorResponse } = require('../middleware/response');

const VALID_ROLES = ['admin', 'employee', 'consumer'];

// GET /users
async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    return successResponse(res, users);
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// GET /users/:id
async function getUserById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid user ID.', {});
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ association: 'items', attributes: ['itemId', 'name', 'category', 'storageType'] }]
    });
    if (!user) return errorResponse(res, 404, 'NOT_FOUND', `User ${id} not found.`, {});
    return successResponse(res, user);
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// POST /users
async function createUser(req, res) {
  const { firstName, lastName, email, password, userRole } = req.body;
  if (!firstName || !lastName || !email || !password)
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'firstName, lastName, email, and password are required.', {});
  if (userRole && !VALID_ROLES.includes(userRole))
    return errorResponse(res, 400, 'VALIDATION_ERROR', `Invalid userRole. Allowed: ${VALID_ROLES.join(', ')}.`, {});
  try {
    const user = await User.create({ firstName, lastName, email, password, userRole: userRole || 'consumer' });
    return successResponse(res, { userId: user.userId }, 201);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return errorResponse(res, 409, 'CONFLICT', 'Email already in use.', {});
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// PUT /users/:id
async function updateUser(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid user ID.', {});
  const { firstName, lastName, userRole } = req.body;
  if (!firstName && !lastName && !userRole)
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'Provide at least one field to update.', {});
  if (userRole && !VALID_ROLES.includes(userRole))
    return errorResponse(res, 400, 'VALIDATION_ERROR', `Invalid userRole.`, {});
  try {
    const user = await User.findByPk(id);
    if (!user) return errorResponse(res, 404, 'NOT_FOUND', `User ${id} not found.`, {});
    await user.update({ firstName, lastName, userRole });
    return successResponse(res, { userId: user.userId });
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// DELETE /users/:id
async function deleteUser(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid user ID.', {});
  try {
    const user = await User.findByPk(id);
    if (!user) return errorResponse(res, 404, 'NOT_FOUND', `User ${id} not found.`, {});
    await user.destroy();
    return successResponse(res, { userId: id });
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
