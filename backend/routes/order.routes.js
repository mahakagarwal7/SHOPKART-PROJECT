import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  updateOrderStatus
} from "../controllers/order.controller.js";
import isAuthenticated  from "../middlewares/auth.middleware.js";

const router = express.Router();

// All order endpoints require user authentication
router.post("/create-payment-order", isAuthenticated, createPaymentOrder);
router.post("/verify-payment", isAuthenticated, verifyPayment);
router.get("/", isAuthenticated, getUserOrders);
router.get("/:id", isAuthenticated, getOrderById);

// Bonus Challenge (+10 Marks): development / admin status progression
router.patch("/:id/status", isAuthenticated, updateOrderStatus);

export default router;
