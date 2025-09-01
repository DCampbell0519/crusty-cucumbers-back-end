const jwt = require('jsonwebtoken')

function verifyToken (req, res, next) {
    try {
    
        const token = req.headers.authorization.split(' ')[1] // ['Bearer', '<token>'][1]
            
                // if the token is valid and was signed with our secret key
                // this will return whatever was in the paylod when this token
                // was created
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                
                req.user = decoded.payload // contains the user data that was stored on sign-in
        
                next()

    } catch (error) {
        res.status(401).json({ error: 'Invalid Token' })
    }
    
}

module.exports = verifyToken