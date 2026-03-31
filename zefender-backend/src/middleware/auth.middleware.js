// Auth middleware disabled temporarily — pending founder discussion
// TODO: re-enable JWT verification once auth strategy is confirmed
const verifyToken = (req, res, next) => {
  next();
};

module.exports = { verifyToken };
