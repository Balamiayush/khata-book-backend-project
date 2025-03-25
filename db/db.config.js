//require mongooes
//db url
//function 
//export

const mongoose = require('mongoose');
const db = 'mongodb+srv://aryanbalami54:OlF3GuoDxGLooTRc@cluster0.f0pxv.mongodb.net/'
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