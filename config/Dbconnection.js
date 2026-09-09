const mongoose =require('mongoose')

const ConnectDB = () => {
    try {
        const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1/Scrab-PMK';
        mongoose.connect(dbURI).then(() => {
            console.log('Database is connected to:', dbURI.includes('127.0.0.1') ? 'Local MongoDB' : 'Cloud MongoDB');
        }).catch((err) => {
            console.error('Error connecting to MongoDB:', err.message);
        });
    } catch (error) {
        console.log(error, 'error in connecting config');
    }
};

module.exports=ConnectDB
