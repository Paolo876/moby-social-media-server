const express = require('express');
const app = express(); //initialize express
const cors = require("cors");
require("dotenv").config();

//middlewares
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const cookieParser = require("cookie-parser");


app.use(cookieParser());
app.use(express.json());
app.use(cors());

const sequelize = require("./config/database"); 

const PORT = process.env.PORT || 3001;


//routes
app.get("/", (req,res) => res.send("APP IS ONLINE..."))
app.use("/auth", require("./routes/Users"));


//custom errorhandling (middleware)
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => console.log("LISTENING TO PORT", PORT))

