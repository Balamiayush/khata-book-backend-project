//require mongooes
//db url
//function 
//export

const mongoose = require('mongoose');
require('dotenv').config();
const dbUrl = process.env.MONGO_DB_URL;
const connectDB = async () => {
    try {
        await mongoose.connect(db)
        console.log('db connected');
    }
    catch (err) {
        console.log(err);
    }
}
module.exports = connectDB;