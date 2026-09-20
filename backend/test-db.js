import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
console.log(process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED');
mongoose.connect(process.env.MONGO_URI)
  .then(()=>{
    console.log('Connected successfully!');
    process.exit(0);
  })
  .catch((err)=>{
    console.error('Connection failed:',err.message);
    process.exit(1);
  });