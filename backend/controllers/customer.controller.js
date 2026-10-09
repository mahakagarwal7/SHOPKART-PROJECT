import Customer from '../models/customer.model.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';

const cookieOptions = {
    httpOnly : true
}




export const registerUser = async(req,res)=>{
    const {fullName,email,password,phone} = req.body;

    try {
        if(!fullName||!email||!password||!phone){
            return res.status(422).json({
                message : "All fields are required"
            });
        }

       

        const emailExists = await Customer.findOne({email});

        if(emailExists){
            return res.status(400).json({message : "email already exists"});
        }

        

        if(password.length < 6){
            return res.status(400).json({message : "Password must me atleast 6 characters"})
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const newUser = await Customer.create({fullName,email,password:hashedPassword,phone});

        return res.status(200).json({message : 'Login Successfully',
            user : newUser
        })



    }catch(error){
        console.log(error);
        return res.status(500).json({message : "Internal Server Error"});
    }


}

export const loginUser = async(req,res)=>{
   try{
      const {email,password} = req.body

      if(!email || !password){
          return res.status(422).json({message : "All fields are required"});
      }

     

     




      
      const userExists = await Customer.findOne({email})

       if(!userExists){
         return res.status(400).json({message : "User not found"});
      }

      const correctPassword = await bcrypt.compare(password,userExists.password);

      if(!correctPassword){
        return res.status(400).json({
            message : "Invalid Password"
        })
      }

      const token = generateToken(userExists._id)
      res.cookie("token",token,cookieOptions);


      res.status(200).json({message: "Login Successfully",
         user : userExists
      })





   }catch(error){
       console.log(error);
       return res.status(500).json({message : "Internal Server Error"});
   }
}

export const getUser = (req,res)=>{
    res.status(200).json(req.user);
}

export const logOutUser = async(req,res)=>{
    try{
        res.clearCookie("token",cookieOptions)
        return res.status(200).json({message : "LogOut Successfully"})
    }catch(error){
        console.log(error)
        return res.status(500).json({message : "Internal Server Issue"})
    }
}


export const changePassword = async(req,res)=>{
    try{
    const {oldPassword,newPassword} = req.body;

    if(!oldPassword || !newPassword){
        return res.status(422).json({message : "Both oldPassword and newPassword are required"});
    }

    const user = req.user
    if(!user) return res.status(401).json({message : "Unauthorized"});

    

    const correctPassword = await bcrypt.compare(oldPassword,user.password);
    if(!correctPassword) return res.status(400).json({message : "Old password is incorrect"});

    if(newPassword.length < 6) return res.status(400).json({message : 'New Password must be atleast 6 characters'});

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword,salt);
    await user.save();

    return res.status(200).json({message : "Password changed successfully"})

    }
    catch(error){
        console.log(error);
        return res.status(500).json({message : "Internal Server Issue"})
    }

}

