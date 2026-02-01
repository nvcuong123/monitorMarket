import jwt from "jsonwebtoken";
const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  // console.log(req.headers);
  // console.log(req.cookies);
  // const token = req.cookies.access_token;
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET_STRING);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    // console.log(req.userRole);
    let adminRight =
      req.userRole === "admin" ||
      (req.userRole === "admin-dev" && process.env.NODE_ENV === "development");
    // console.log(adminRight);
    if (req.baseUrl === "/api/admin" && !adminRight) {
      return res.status(401).json({
        success: false,
        message: "Please login by Admin password to access this function",
      });
    }
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

export default verifyToken;
