const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "zefender_jwt_secret";

// Soft token check — decodes JWT if present, sets req.user
// Does NOT block requests without a token (superadmin has no JWT)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next(); // allow through — superadmin has no token
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET); // { id, email, role }
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Hard check — only superadmin (requires valid JWT with role=superadmin)
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Superadmin access required" });
  }
  next();
};

// Hard check — only admin (requires valid JWT with role=admin)
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { verifyToken, requireSuperAdmin, requireAdmin };
