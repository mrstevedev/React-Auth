const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const passport = require('passport')
const passportLocal = require('passport-local').Strategy
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const app = express();
const User = require('./User')

mongoose.connect('mongodb+srv://node-rest-shop:node-rest-shop@node-rest-shop-7dgup.mongodb.net/react-auth?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then((conn) => console.log(`Mongoose connected to ${ conn.connection.name }`))

// Middleware 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
    origin: 'http://localhost:3000', // Location of the react app 
    credentials: true
}))

app.use(session({
    secret: "secretCode",
    resave: true,
    saveUninitialized: true
}))

app.use(cookieParser('secretCode'))
app.use(passport.initialize())
app.use(passport.session())
require('./passport')(passport)

// End Middleware

// Routes
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) throw err;
        if(!user) res.send('No User Exists')
        else {
            req.logIn(user, err => {
                if(err) throw err
                jwt.sign({ user }, 'secret', { expiresIn: '1h' }, (err, token) => {
                    res.send({
                        message: 'Successfully Authenticated',
                        jwt: token
                    })
                })
            })
        }
    })(req, res, next)
})

app.post('/register', (req, res) => {
    // console.log(req.body.registerUsername)
    User.findOne({ username: req.body.username }, async (err, doc) => {
        if(err) throw err
        if(doc) res.send('User already exists')
        if(!doc) {
            const hash = await bcrypt.hash(req.body.password, 10)
            const newUser = new User({
                username: req.body.username,
                password: hash
            })
            await newUser.save()
            res.status(200).json({ success: true, message: 'User created!', data: newUser })
        }
    })
})
app.get('/user', (req, res) => {
    console.log('get /user')
    res.send(req.user)   
})

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server started on port ${ PORT }`))