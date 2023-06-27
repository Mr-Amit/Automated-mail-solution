const express = require('express');
const dotenv = require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/database')
const MongoStore = require('connect-mongo');
const indexRouter = require("./routes/index");
const authRouter = require('./routes/auth')
const cookieParser = require('cookie-parser');
const UserService = require('./services/UserService')

require('./config/passport')(passport);

let app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine','ejs');

app.use(express.urlencoded({extended:true}))
app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    })
  )

app.use(passport.initialize())
app.use(passport.session())

// Use Routes
app.use(indexRouter)
app.use(authRouter)

app.listen(PORT, () => {
    connectDB()
    console.log(`Listening at http://localhost:${PORT}`)
})


