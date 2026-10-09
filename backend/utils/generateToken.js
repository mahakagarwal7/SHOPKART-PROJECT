import jwt from "jsonwebtoken";

const generateToken = (customerId) => {
    const secret = process.env.JWT_SECRET || process.env.jwt_secret || "shopkart_secret_key";
    return jwt.sign({ customerId }, secret, { expiresIn: "7d" });
};

export default generateToken;