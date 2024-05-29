const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const cors = require("cors");
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 5000; // Corrected bitwise OR to logical OR

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected."))
.catch((err) => console.log(err));

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: "secretKey", // Changed for a more neutral secret
    saveUninitialized: true,
    resave: false,
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Route for high-rated mangas
app.post('/highrated', (req, res) => {
    const username = req.body.username;
    const highratedmangas = [
        { title: "Attack on Titan", releaseDate: "2023-01-10" },
    ];
    res.render('highrated', { username, highratedmangas });
});

// Route for most viewed mangas
app.post('/mostviewed', (req, res) => {
    const username = req.body.username;
    const mostviewedmangas = [
        { title: "One Piece", releaseDate: "2023-01-15" },
    ];
    res.render('mostviewed', { username, mostviewedmangas });
});

// Route for latest mangas
app.post('/manga', (req, res) => {
    const username = req.body.username;
    const mangas = [
        { title: "My Hero Academia", releaseDate: "2023-01-20" }
    ];
    res.render('manga', { username, mangas });
});

app.use('/uploads', express.static('uploads'));

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use("", require("./routes/routes"));

app.listen(PORT, () => console.log(`Listening at ${PORT}`));
