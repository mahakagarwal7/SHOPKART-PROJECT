import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

const port = process.env.PORT || 8081;
const dbUrl = process.env.MONGO_URI || process.env.dbUrl || process.env.DB_URL || "mongodb://127.0.0.1:27017/shopkart";

const app = express();
app.set("trust proxy", 1);


app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    }
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(cookieParser());

mongoose.connect(dbUrl).then(() => {
    console.log("DB Connected Successfully");
}).catch((err) => {
    console.error("DB Connection Error:", err.message || err);
});

app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.get("/", (req, res) => {
    res.json({ message: "ShopKart Customer Authentication Service is running" });
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});



