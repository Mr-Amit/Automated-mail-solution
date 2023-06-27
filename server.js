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

// Mongo & Template Setup
var app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine','ejs');

// Middleware & DB for Sessions Setup
app.use(express.urlencoded({extended:true}))
app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    })
  )
  // Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Use Routes
app.use(indexRouter)
app.use(authRouter)

app.listen(PORT, () => {
    connectDB()
    console.log(`Listening at http://localhost:${PORT}`)
})


UserService.initateEmailProcessing({
  email: 'amit.kumar221099@gmail.com',
  accessToken: 'ya29.a0AWY7CknTEBJk6bdhTE2xO3lfm4QDVtGu_FMbxoUxWqOpg5H9502L3sP9zupqfN5v5egtXMyPp67eAhwivBgJ3Gh8DSFy3HBSBRIJPhbhJixrm9AWmPd8IExLrJpH-eqQx1QlPmV1iUAeugokFGscN6voXXulaCgYKAfISARESFQG1tDrpWHmoc42JAr1m0GL4Rz7qsw0163'
})