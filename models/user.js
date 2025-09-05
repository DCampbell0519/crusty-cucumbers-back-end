const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true,
    },
    hashedPassword: {
        type: String, 
        required: true,
    },
    email: {
        type: String, 
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.hashedPassword
    }
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

module.exports = User