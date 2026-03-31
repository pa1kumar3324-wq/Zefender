const jwt = require("jsonwebtoken");

// POST /api/auth/login
// Admin login — returns a JWT for use in all protected routes
const loginAdmin = (req, res) => {
  try {
    const { username, password } = req.body;

    const validUsername = process.env.ADMIN_USERNAME || "admin";
    const validPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (username !== validUsername || password !== validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: "admin", role: "admin" },
      process.env.JWT_SECRET || "zefender_jwt_secret",
      { expiresIn: "7d" }
    );

    res.json({ token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { loginAdmin };
