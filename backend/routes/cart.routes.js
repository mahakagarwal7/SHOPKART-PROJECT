import express from 'express';
import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
} from '../controllers/cart.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';

const cartRoutes = express.Router();

cartRoutes.use(isAuthenticated);

cartRoutes.get('/', getCart);
cartRoutes.post('/:productId', addToCart);
cartRoutes.patch('/:productId', updateCartQuantity);
cartRoutes.delete('/:productId', removeFromCart);
cartRoutes.delete('/', clearCart);

export default cartRoutes;
