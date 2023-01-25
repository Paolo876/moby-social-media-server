const express = require('express');
const app = express(); //initialize express
const cors = require("cors");
require("dotenv").config();

//middlewares
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cors(
    {
        credentials: true, 
        origin:  process.env.CLIENT_ORIGINS.split(", "),
        methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
        preflightContinue: true,
        allowedHeaders: ['Content-Type', 'Authorization', "Cookie"],
}));//to allow api connection from computer to react project

app.use(cookieParser());


const sequelize = require("./config/database"); 
//load db models
require("./utils/importDBModels")()
require("./models/associations/associations")()
const PORT = process.env.PORT || 3001;

//routes
app.get("/", (req,res) => res.send("APP IS ONLINE..."))
app.use("/api/auth", require("./routes/Users"));
app.use("/api/posts", require("./routes/Posts"));
app.use("/api/comments", require("./routes/Comments"));
app.use("/api/imagekit", require("./routes/Imagekit"));


//custom errorhandling (middleware)
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => console.log("LISTENING TO PORT", PORT))

