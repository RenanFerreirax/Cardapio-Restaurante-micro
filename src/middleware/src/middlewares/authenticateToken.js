const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.send(401, { message: "Token ausente." });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res
      .send(401, { message: "Formato inválido. Use: Authorization: Bearer <token>" });
  }

  try {
    const decoded = jwt.verify(token, "62510d4a5f3874b0e89495da244e6f0f8a3a44aa6c9d18972e690060293b2f3882003cba1b371a844134dcd3ae867171c1905464236f74eff773d1c78163b016");
    req.user = decoded; // { sub, username, role, iat, exp }
    return next();
  } catch (err) {
    return next();
  }
}

module.exports = { authenticateToken };
