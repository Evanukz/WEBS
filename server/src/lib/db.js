import mongoose from 'mongoose';

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI. Set it to your MongoDB Atlas connection string.');

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
}

export { connectDB };

