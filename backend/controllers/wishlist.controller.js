import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';


export const addToWishlist = async (req, res) => {
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

        const user = await Customer.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

     
        const isAlreadyWishlisted = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (isAlreadyWishlisted) {
            return res.status(409).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        user.wishlist.push(productId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Product added to wishlist'
        });
    } catch (error) {
        console.error('Add to Wishlist Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


export const getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await Customer.findById(userId).populate({
            path: 'wishlist',
            select: '_id name price category image stock description'
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

       
        const validWishlist = (user.wishlist || []).filter((item) => item !== null);

        return res.status(200).json({
            success: true,
            count: validWishlist.length,
            wishlist: validWishlist
        });
    } catch (error) {
        console.error('Get Wishlist Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

export const removeFromWishlist = async (req, res) => {
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

       
        const isPresent = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!isPresent) {
            return res.status(404).json({
                success: false,
                message: 'Product not in wishlist'
            });
        }

        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist'
        });
    } catch (error) {
        console.error('Remove from Wishlist Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


export const toggleWishlist = async (req, res) => {
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

        const user = await Customer.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const index = user.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (index > -1) {
            
            user.wishlist.splice(index, 1);
            await user.save();
            return res.status(200).json({
                success: true,
                saved: false,
                message: 'Product removed from wishlist'
            });
        } else {
           
            user.wishlist.push(productId);
            await user.save();
            return res.status(200).json({
                success: true,
                saved: true,
                message: 'Product added to wishlist'
            });
        }
    } catch (error) {
        console.error('Toggle Wishlist Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


export const getWishlistCount = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id);
        const count = user ? user.wishlist.length : 0;
        return res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get Wishlist Count Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};
