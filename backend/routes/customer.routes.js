import express from "express";
import {
    registerUser,
    loginUser,
    getUser,
    logOutUser,
    changePassword
} from "../controllers/customer.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const customerRoutes = express.Router();

// Public routes
customerRoutes.post("/register", registerUser);
customerRoutes.post("/login", loginUser);

// Protected routes
customerRoutes.get("/me", isAuthenticated, getUser);
customerRoutes.post("/logout", isAuthenticated, logOutUser);
customerRoutes.post("/logOut", isAuthenticated, logOutUser); // alias for backwards compatibility
customerRoutes.patch("/change-password", isAuthenticated, changePassword);

export default customerRoutes;