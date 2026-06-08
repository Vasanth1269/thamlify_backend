import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const token = req.cookies?.token;
  
console.log("🍪 token:", token);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Please login again",
    });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Invalid token",
      });
    }

    req.userId = decodedToken.id; 
    console.log("cooki",req.userId)
    // ✅ attach user safely
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid",
    });
  }
};

export default userAuth;
