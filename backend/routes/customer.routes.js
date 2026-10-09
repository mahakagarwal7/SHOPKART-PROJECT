import express from "express";
import { loginUser,logOutUser,registerUser } from "../controllers/customer.controller.js";

import { getUser } from "../controllers/customer.controller.js";
import { changePassword } from "../controllers/customer.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";


const customerRoutes = express.Router();

customerRoutes.post('/register',registerUser);
customerRoutes.post('/login',loginUser);
customerRoutes.get('/me',isAuthenticated,getUser)
customerRoutes.post('/logOut',logOutUser)
customerRoutes.patch('/change-password',changePassword)


export default customerRoutes;