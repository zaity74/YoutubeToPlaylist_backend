import mongoose from 'mongoose';

const dbConnect = async () => {
    try {
        mongoose.set('strictQuery', false);
        const connected = await mongoose.connect(process.env.MANGO_URI);
        console.log(`DATABASE CONNECTED ${connected.connection.host}`);
    } catch (error) {
        console.log(error.message);
    }
};

export default dbConnect;