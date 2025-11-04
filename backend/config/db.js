const mongoose = require('mongoose');

let conn = null;

const connectDB = async () => {
  if (conn && mongoose.connection.readyState === 1) return conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set; backend will fail on DB operations.');
    return null;
  }
  try {
    conn = await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
    if (mongoose.connection.readyState === 1) console.log('MongoDB connected');
    return conn;
  } catch (err) {
    console.error('MongoDB connection error', err.message);
    throw err;
  }
};

module.exports = connectDB;
