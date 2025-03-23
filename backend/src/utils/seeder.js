const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');

// Load env variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/schedly?authSource=admin')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create admin user
const createAdminUser = async () => {
  try {
    // First check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@schedly.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@schedly.com',
      password: 'admin123',
      role: 'admin'
    });
    
    console.log('Admin user created successfully');
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
};

// Run seeder and exit
const runSeeder = async () => {
  await createAdminUser();
  console.log('Database seeding completed');
  
  // Exit the process
  process.exit();
};

runSeeder(); 