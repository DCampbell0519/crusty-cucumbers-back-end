const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const testJwtWRouter = require('./controllers/test-jwt.js')
const authRouter = require('./controllers/auth.js')
const userRouter = require('./controllers/user.js')

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB on ${mongoose.connection.name}`)
})


app.use(cors()) // allows other API's or sites to connect to our API
app.use(express.json()) // Accept JSON in req.body
app.use(morgan('dev')) // logs requests to the console

// Routes
app.use('/test-jwt', testJwtWRouter)
app.use('/auth', authRouter)
app.use('/user', userRouter)




app.listen(3000, () => {
    console.log('Welcome to the Thunderdome!')
})