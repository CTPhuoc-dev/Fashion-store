const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    if (!token) return res.status(403).json({ error: "No token provided" });

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(403).json({ error: "Authentication failed" });
  }
};