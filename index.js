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

//routes
app.get("/", (req,res) => res.send("APP IS ONLINE..."))
app.use("/api/main", require("./routes/Main"));
app.use("/api/auth", require("./routes/Users"));
app.use("/api/posts", require("./routes/Posts"));
app.use("/api/comments", require("./routes/Comments"));
app.use("/api/chat", require("./routes/Chat"));
app.use("/api/imagekit", require("./routes/Imagekit"));
app.use("/api/friends", require("./routes/Friends"));


//custom errorhandling (middleware)
app.use(notFound)
app.use(errorHandler)


//socket io
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);
// io.attach(httpServer)
io.on('connection', (socket) => {
    console.log(socket.id);
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
app.set("socketio", io);

// const friendHandlers = require("./events/friendHandlers");
// const chatHandlers = require("./events/chatHandlers");

// io.of("users").on("connection", async (socket) => userHandlers(io, socket))
// io.of("friends").on("connection", async (socket) => friendHandlers(io, socket))

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => console.log("LISTENING TO PORT", PORT));

// app.listen(PORT, () => console.log("LISTENING TO PORT", PORT))

