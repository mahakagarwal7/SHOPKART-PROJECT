import mongoose from "mongoose";
import Product from "../models/product.model.js";


export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

       
        if (
            name === undefined ||
            description === undefined ||
            price === undefined ||
            category === undefined ||
            image === undefined ||
            stock === undefined ||
            (typeof name === "string" && name.trim() === "") ||
            (typeof description === "string" && description.trim() === "") ||
            (typeof category === "string" && category.trim() === "") ||
            (typeof image === "string" && image.trim() === "")
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, description, price, category, image, stock) are required"
            });
        }

        const numPrice = Number(price);
        const numStock = Number(stock);

        
        if (isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid number greater than 0"
            });
        }

      
        if (isNaN(numStock) || numStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a valid number greater than or equal to 0"
            });
        }

        const product = await Product.create({
            name: typeof name === "string" ? name.trim() : name,
            description: typeof description === "string" ? description.trim() : description,
            price: numPrice,
            category: typeof category === "string" ? category.trim() : category,
            image: typeof image === "string" ? image.trim() : image,
            stock: numStock
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (error) {
        console.error("Create Product Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export const getAllProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;

        const query = {};

       
        if (search && search.trim() !== "") {
            query.name = { $regex: search.trim(), $options: "i" };
        }

        
        if (category && category.trim() !== "" && category.trim().toLowerCase() !== "all") {
            query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
        }

       
        let sortOption = { createdAt: -1 };
        if (sort === "price_asc") {
            sortOption = { price: 1 };
        } else if (sort === "price_desc") {
            sortOption = { price: -1 };
        }

        const products = await Product.find(query).sort(sortOption);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Get All Products Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id);

        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Get Product By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct("category");
        return res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error("Get Categories Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
