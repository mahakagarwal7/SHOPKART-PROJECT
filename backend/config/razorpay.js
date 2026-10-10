import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_ShopKartKeyId",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "shopkart_test_secret_key_2026"
});

export default razorpay;
