// middleware/auth.js - Role-based access control middleware
// Role hierarchy: admin > employee > consumer
// Roles: "admin", "employee", "consumer"

/**
 * Returns middleware that allows only the specified roles.
 * The current user's role is read from the x-user-role request header.
 *
 * @param  {...string} allowedRoles - roles permitted to access this route
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.headers["x-user-role"];

    if (!userRole) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: "FORBIDDEN",
          message: "Missing x-user-role header. Access denied.",
          details: {}
        }
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action.",
          details: {
            yourRole: userRole,
            requiredRoles: allowedRoles
          }
        }
      });
    }

    // Attach role to request for downstream use
    req.userRole = userRole;
    next();
  };
}

module.exports = { authorize };
