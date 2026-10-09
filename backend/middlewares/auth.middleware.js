import jwt from 'jsonwebtoken'
import Customer from '../models/customer.model.js'

const isAuthenticated = async(req,res,next) => {
    try{
        const token = req.cookies.token;

        if(!token){
            return res.status(400).json({message : 'No token Found'});
        }

        const decoded = jwt.verify(token,process.env.jwt_secret);

        const user = await Customer.findById(decoded.customerId);

        console.log(decoded);

        if(!user){
            return res.status(404).json({message : "User not found"})
        }

        req.user = user
        next()


    }catch(error){
        console.log(error);
        return res.status(500).json({message : "Internal Server Error"})
    }
}

export default isAuthenticated




