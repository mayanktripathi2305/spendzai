const express = require("express");
const route  = require("./Routes/route");
const fileUpload = require("express-fileupload")
const cors = require("cors")
const app = express()
require("dotenv").config();
const port = process.env.PORT || 4000;

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
const allowedOrigins = ["http://localhost:5173" , "https://mezengaexplore-staging.vercel.app/hotels"]; 

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(route)



app.get("/",(req,res)=>{
    res.send(`<h1>Hii Everyone Bank Statement Here</h1>`)
})

app.listen(port,()=>{
    console.log("App is running")
})