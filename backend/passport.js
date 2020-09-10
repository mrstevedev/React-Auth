const User = require('./User')
const bcrypt = require('bcryptjs')
const localStrategy = require('passport-local').Strategy

module.exports = function(passport) {
    passport.use(
        new localStrategy((username, password, done) => {
            User.findOne({ username: username }, (err, user) => {
                if(err) throw err;
                if(!user) return done(null, false, { message: 'Incorrect username.' })
                if(!user.password) return done(null, false, { message: 'Incorrect password.' })
                bcrypt.compare(password, user.password, (err, result) => {
                    if(err) throw err;
                    if(result === true) {
                        return done(null, user)
                    } else {
                        return done(null, false)
                    }
                })
            })
        })
    )

    passport.serializeUser((user, cb) => {
        cb(null, user.id)
    })

    passport.deserializeUser((id, cb) => {
        User.findOne({ _id: id }, (err, user) => {
            const userInfo = {
                username: user.username
            }
            cb(err, userInfo)
        })
    })
}