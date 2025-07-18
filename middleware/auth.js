// const { verifyAccessToken } = require('../utils/jwt');
// const User = require('../models/User');

// const authenticateToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Access token required'
//       });
//     }

//     const decoded = verifyAccessToken(token);
//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found'
//       });
//     }ś

//     req.user = user;
//     next();
//   } catch (error) {
//     return res.status(403).json({
//       success: false,
//       message: 'Invalid or expired token'
//     });
//   }
// };

// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied'
//       });
//     }
//     next();
//   };
// };

// module.exports = { authenticateToken, authorize };


const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing or malformed'
      });
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Find user by decoded ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorize
};