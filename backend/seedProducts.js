import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.model.js';

dotenv.config();

const dbUrl = process.env.MONGO_URI || process.env.dbUrl || process.env.DB_URL || 'mongodb://127.0.0.1:27017/shopkart';

const sampleProducts = [
  // Electronics
  {
    name: 'Ultra-Slim 4K Monitor 27"',
    description: 'Crisp IPS display with 99% sRGB color gamut, USB-C 65W charging pass-through, and ultra-thin bezels.',
    price: 18999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    stock: 14
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical gaming keyboard with hot-swappable tactile blue switches and aluminium frame.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    stock: 15
  },
  {
    name: 'Precision Wireless Mouse',
    description: 'Ergonomic silent-click wireless mouse with customizable DPI, multi-device Bluetooth, and fast recharge.',
    price: 1499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    stock: 20
  },
  {
    name: 'Smart AMOLED Fitness Watch',
    description: 'Water-resistant smartwatch featuring always-on AMOLED display, heart rate tracking, SpO2, and 14-day battery.',
    price: 3499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    stock: 12
  },

  // Audio
  {
    name: 'Studio Wireless Headphones',
    description: 'High-fidelity over-ear headphones with active hybrid noise cancellation, 40-hour playback, and plush memory foam.',
    price: 4999,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    stock: 25
  },
  {
    name: 'Portable Waterproof Bluetooth Speaker',
    description: 'Deep 360-degree bass with IPX7 waterproof rating, 24-hour battery, and rugged outdoor travel casing.',
    price: 2499,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
    stock: 18
  },
  {
    name: 'True Wireless Noise-Cancelling Earbuds',
    description: 'Compact wireless earbuds with spatial audio, transparency mode, wireless charging case, and IPX5 resistance.',
    price: 3999,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    stock: 22
  },

  // Fashion
  {
    name: 'Classic Vintage Denim Jacket',
    description: 'Timeless vintage wash denim jacket crafted from 100% durable cotton with tailored brass button closures.',
    price: 2499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
    stock: 30
  },
  {
    name: 'Lightweight Breathable Running Shoes',
    description: 'Engineered mesh athletic sneakers with cushioned shock-absorbing midsole and durable all-terrain grip.',
    price: 3299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    stock: 18
  },
  {
    name: 'Minimalist Polarized Sunglasses',
    description: 'UV400 protective polarized sunglasses with featherweight titanium frame and anti-reflective lenses.',
    price: 1799,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    stock: 24
  },
  {
    name: 'Canvas Commuter Laptop Backpack',
    description: 'Water-resistant vintage canvas backpack with padded 15.6" laptop compartment and ergonomic straps.',
    price: 2199,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    stock: 16
  },

  // Home & Living
  {
    name: 'Architect Dimmable LED Desk Lamp',
    description: 'Touch-control dimmable LED architect desk lamp with 15W wireless fast-charging base and auto-timer.',
    price: 1899,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    stock: 10
  },
  {
    name: 'Ceramic Pour-Over Coffee Brewer Set',
    description: 'Artisan handcrafted ceramic dripper with heat-resistant glass carafe and reusable stainless steel filter.',
    price: 1599,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
    stock: 14
  },
  {
    name: 'Ultrasonic Essential Oil Aroma Diffuser',
    description: 'Silent whisper ultrasonic aromatherapy diffuser with 7 ambient LED mood lights and auto shut-off safety.',
    price: 1299,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
    stock: 19
  },

  // Books & Media
  {
    name: 'The Pragmatic Programmer: 20th Anniversary Edition',
    description: 'Your journey to mastery: classic software engineering handbook by David Thomas and Andrew Hunt.',
    price: 1299,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    stock: 40
  },
  {
    name: 'Atomic Habits by James Clear',
    description: 'An easy & proven way to build good habits and break bad ones. Hardcover edition with bonus work sheets.',
    price: 699,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    stock: 35
  }
];

async function seed() {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB for seeding...');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const created = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${created.length} products across all categories!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
