const requirePermission = (permission) => {
  return async (req, reply) => {
    if (!req.apiKey) {
      return reply.code(401).send({
        success: false,
        message: "Authentication required.",
      });
    }

    const hasPermission = req.apiKey.permissions && req.apiKey.permissions[permission] === true;
    if (!hasPermission) {
      return reply.code(403).send({
        success: false,
        message: "Permission denied.",
      });
    }
  };
};

module.exports = { requirePermission };
