import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

      
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

     
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

       
        if (product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Product is currently out of stock'
            });
        }

        const user = await Customer.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const cartIndex = user.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (cartIndex > -1) {
        
            const newQuantity = user.cart[cartIndex].quantity + 1;
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more. Maximum available stock is ${product.stock} units.`
                });
            }
            user.cart[cartIndex].quantity = newQuantity;
        } else {
           
            user.cart.push({
                product: productId,
                quantity: 1
            });
        }

        await user.save();

        await user.populate({
            path: 'cart.product',
            select: '_id name price image stock category description'
        });

        const validCart = (user.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: 'Cart updated',
            cart: validCart
        });
    } catch (error) {
        console.error('Add to Cart Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


export const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await Customer.findById(userId).populate({
            path: 'cart.product',
            select: '_id name price image stock category description'
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const validCart = (user.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            cart: validCart
        });
    } catch (error) {
        console.error('Get Cart Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const userId = req.user._id;

      
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const numQuantity = Number(quantity);
        if (
            quantity === undefined ||
            isNaN(numQuantity) ||
            !Number.isInteger(numQuantity) ||
            numQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be an integer greater than or equal to 1'
            });
        }

      
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

   
        if (numQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Requested quantity exceeds available stock (${product.stock} units)`
            });
        }

        const user = await Customer.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const cartIndex = user.cart.findIndex(
            (item) => item.product.toString() === productId
        );

    
        if (cartIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart'
            });
        }

        user.cart[cartIndex].quantity = numQuantity;
        await user.save();

        await user.populate({
            path: 'cart.product',
            select: '_id name price image stock category description'
        });

        const validCart = (user.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: 'Cart quantity updated',
            cart: validCart
        });
    } catch (error) {
        console.error('Update Cart Quantity Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const user = await Customer.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const cartIndex = user.cart.findIndex(
            (item) => item.product.toString() === productId
        );

      
        if (cartIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart'
            });
        }

        user.cart.splice(cartIndex, 1);
        await user.save();

        await user.populate({
            path: 'cart.product',
            select: '_id name price image stock category description'
        });

        const validCart = (user.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: 'Product removed from cart',
            cart: validCart
        });
    } catch (error) {
        console.error('Remove from Cart Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.cart = [];
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Cart cleared',
            cart: []
        });
    } catch (error) {
        console.error('Clear Cart Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};
