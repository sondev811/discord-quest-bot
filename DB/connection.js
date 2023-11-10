const mongoose = require('mongoose');
require('dotenv/config');

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
};

module.exports = connectDB;
