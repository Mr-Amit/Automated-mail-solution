
const dotenv = require('dotenv').config();
const mongoose = require('mongoose')


mongoose.set('strictQuery', true);
// mongoose.set('debug', true);
mongoose.set('autoIndex', false);

const connectDB = () => {
  try {
    const connection = mongoose.connect(process.env.MONGO_URI,  {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    // console.log('-------->', connection);

    return connection;

  } catch (err) {
      console.error(err);
  }
}

mongoose.connection.once('open', async () => {
  console.log('Connected to MongoDB');
});

module.exports = connectDB;
