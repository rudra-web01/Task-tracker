/**
 * User service — read operations on users.
 */
const UserModel = require('../models/user.model');
const TaskModel = require('../models/task.model');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');

const UserService = {
  listUsers({ role } = {}) {
    return UserModel.findAll({ role });
  },

  async updateEmployeeStatus(userId, isActive, actor) {
  if (!actor || actor.role !== 'admin') {
    throw ApiError.forbidden('Only admins can update employee status');
  }

  if (typeof isActive !== 'boolean') {
    throw ApiError.badRequest('is_active must be true or false');
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role !== 'employee') {
    throw ApiError.badRequest('Only employee accounts can be updated');
  }

  await UserModel.updateStatus(userId, isActive);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: isActive,
  };
},

  async createEmployee({ name, email, password }, actor) {
  if (!actor || actor.role !== 'admin') {
    throw ApiError.forbidden('Only admins can create users');
  }

  if (!name?.trim() || !email?.trim() || !password) {
    throw ApiError.badRequest('Name, email and password are required');
  }

  if (password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await UserModel.findByEmail(normalizedEmail);
  if (existing) {
    throw ApiError.conflict('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return UserModel.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'employee',
  });
},

  async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  /**
   * Tasks belonging to a specific employee (paginated/filterable).
   * Admins may query anyone; users may only query themselves.
   */
  async getTasksForUser(userId, opts = {}, actor) {
    if (actor && actor.role !== 'admin' && actor.id !== userId) {
      throw ApiError.forbidden('You can only view your own tasks');
    }
    const user = await UserModel.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return TaskModel.findAll({ ...opts, assignedTo: userId });
  },
};

module.exports = UserService;
