const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const authRouter = require('./controllers/auth.js')
const userRouter = require('./controllers/user.js')
const { searchMovies } = require('./controllers/movies.js')
const moviesRouter = require('./routes/movies.js')
const reviewsRouter = require('./routes/reviews');

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB on ${mongoose.connection.name}`)
})



app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true })) 

app.use(express.json()) 
app.use(morgan('dev'))


app.use('/auth', authRouter)
app.use('/user', userRouter)

app.use('/api', reviewsRouter)

app.use('/api/movies', moviesRouter)


app.listen(3000, () => {
    console.log('Welcome to the Thunderdome!')
})