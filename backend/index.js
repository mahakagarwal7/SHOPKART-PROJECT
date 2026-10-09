import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import customerRoutes from "./routes/customer.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();



const port = 8081;

const app = express();


mongoose.connect(process.env.dbUrl).then(() =>{
    console.log("DB Connected Successfully");
}).catch((err)=>{
    console.log(err);
})
    


app.use(express.json());
app.use(cookieParser());
app.use('/customers',customerRoutes);



app.listen(port , ()=>{
    console.log(`Server started at ${port}`);
})



