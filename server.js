const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const app = express()
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('express-flash')
const logger = require('morgan')
const connectDB = require('./config/database')
const homeRoutes = require('./routes/home')
const tripRoutes = require('./routes/trips')
const helpers = require('./helpers/helper')

require('dotenv').config({ path: './config/.env' })

// Passport config
require('./config/passport')(passport)

connectDB()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Method Override
app.use(methodOverride((req, res) => {
   if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and replaces it with another method
      let method = req.body._method;
      delete req.body._method;
      return method;
   }
}));

// Sessions
app.use(
   session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
   })
);

// Locals Object
helpers(app)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

// Route Links
app.use('/', homeRoutes)
app.use('/trips', tripRoutes)


const PORT = process.env.PORT || 5000 // run on environment variable or 5000 if not available

// Basic Logging if running in development mode
if (process.env.NODE_ENV === 'development') {
   app.use(logger('dev'));
}

app.listen(process.env.PORT, () => {
   console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}, you better catch it!`)
})    
