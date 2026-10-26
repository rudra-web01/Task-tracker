/**
 * Authentication & authorization middleware.
 *
 *  - authenticate: verifies the Bearer JWT and attaches req.user
 *  - authorize(...roles): allows only the given roles (role-based access)
 */
const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const UserModel = require('../models/user.model');

async function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(
      ApiError.unauthorized('Missing or malformed Authorization header')
    );
  }

  try {
    const payload = verifyToken(token);

    const user = await UserModel.findById(payload.id);

    if (!user || user.is_active === false || user.is_active === 0) {
      return next(ApiError.unauthorized('Account is inactive or unavailable'));
    }

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (_err) {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

/** Restrict a route to one or more roles. Use after authenticate. */
function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
