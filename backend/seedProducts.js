import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.model.js';

dotenv.config();

const dbUrl = process.env.MONGO_URI || process.env.dbUrl || process.env.DB_URL || 'mongodb://127.0.0.1:27017/shopkart';

const sampleProducts = [
  {
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation, 30-hour battery life, and crystal clear sound.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    stock: 25
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical gaming keyboard with hot-swappable tactile blue switches and aluminium frame.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    stock: 15
  },
  {
    name: 'Wireless Ergonomic Mouse',
    description: 'Precision vertical wireless mouse with programmable buttons and rechargeable battery.',
    price: 1499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    stock: 20
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Water-resistant smartwatch featuring AMOLED display, heart rate tracking, and 14-day battery life.',
    price: 3499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    stock: 12
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless vintage wash denim jacket made from 100% durable cotton with brass button closures.',
    price: 2499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
    stock: 30
  },
  {
    name: 'Running Sports Shoes',
    description: 'Lightweight breathable mesh athletic trainers with cushioned shock-absorbing sole.',
    price: 3299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    stock: 18
  },
  {
    name: 'The Pragmatic Programmer',
    description: 'Your journey to mastery: classic software engineering handbook by David Thomas and Andrew Hunt.',
    price: 1299,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    stock: 40
  },
  {
    name: 'Minimalist Desk Lamp',
    description: 'Dimmable LED architect desk lamp with wireless fast charging pad and touch control base.',
    price: 1899,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    stock: 8
  }
];

async function seed() {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB for seeding...');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const created = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${created.length} products!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
