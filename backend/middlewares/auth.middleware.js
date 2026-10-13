import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        const token = req.cookies?.token || bearerToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const secret = process.env.JWT_SECRET || process.env.jwt_secret || "shopkart_secret_key";
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (jwtError) {
            return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
        }

        const user = await Customer.findById(decoded.customerId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: Customer not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export default isAuthenticated;
