
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

  let payload;

  // Only catch token verification errors here.
  try {
    payload = verifyToken(token);
  } catch (err) {
    return next(
      ApiError.unauthorized('Invalid or expired token')
    );
  }

  // Database errors should not be reported as token errors.
  try {
    const user = await UserModel.findById(payload.id);

    if (!user) {
      return next(
        ApiError.unauthorized('Account is unavailable')
      );
    }

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          'You do not have permission to perform this action'
        )
      );
    }

    return next();
  };
}

module.exports = { authenticate, authorize };
