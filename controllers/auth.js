const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const saltRounds = 12;

router.post('/sign-up', async (req, res) => {
    // res.json({message: 'Sign up route'})
    try {
        // make sure a user with this username does not exist
        const userInDatabase = await User.findOne({ username: req.body.username})

        if (userInDatabase) {
            return res.status(409).json({ error: 'Username already taken'})
        }

        console.log(req.body)
        // No user with that username exists, let's create a new user
        const user = await User.create({
            username: req.body.username,
            hashedPassword: bcrypt.hashSync(req.body.password, saltRounds),
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        })
        
        const payload = { username: user.username, _id: user._id}

        // create a new auth jwt token for the new user 
        const token = jwt.sign({ payload }, process.env.JWT_SECRET)

        res.status(201).json({ token })

    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

router.post('/sign-in', async (req, res) => {
    try {
        const userInDatabase = await User.findOne({ username: req.body.username})

        if (!userInDatabase) {
            return res.status(409).json({ error: 'Invalid Credentials, user does not exist'})
        }

        // this will return true if the passwords match, and false if they do not
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, userInDatabase.hashedPassword)

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Invalid Password' })
        }

        const payload = { username: userInDatabase.username, _id: userInDatabase._id}

        // create a new auth jwt token for the new user
        const token = jwt.sign({ payload }, process.env.JWT_SECRET) 

        res.status(200).json({ token })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

router.get('/sign-out', (req, res) => {
    res.json('You have successfully logged out')
})

module.exports = router