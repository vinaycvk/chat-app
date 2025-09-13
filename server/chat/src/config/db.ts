import mongoose from "mongoose";


const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB is already connected");
      return;
    }

    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/user-service";
    await mongoose.connect(mongoURI, {
        dbName: "Chatappmicroservicesapp",
    });
    console.log("MongoDB connected successfully");
    } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);    
    }
}

export default connectDB;