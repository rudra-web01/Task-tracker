/**
 * Auth service — registration & login business logic.
 * Hashing (bcrypt) and token issuing happen here; controllers stay thin.
 */
const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 10;
const VALID_ROLES = ['admin', 'employee'];

function toPublic(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

const AuthService = {
  // baaki existing methods yahin rahenge

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);

    if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = signToken({
      id: user.id,
      role: user.role,
      name: user.name,
    });

    return { user: toPublic(user), token };
  },
};

module.exports = AuthService;
