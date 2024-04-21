const express = require("express");
const router = express.Router();
const Manga = require("../models/mangaModel");
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads");
    }, filename: function(req, file, cb) {
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
});

var uploadCover = multer({
    storage: storage,
}).single('coverImg');

router.post('/add', uploadCover, (req, res) => {
    const manga = new Manga({
        title: req.body.title,
        description: req.body.description,
        coverImg: req.file.filename,
    });

    manga.save()
        .then(() => {
            req.session.message = {
                type: "success",
                message: "Manga Added Successfully"
            };
            res.redirect("/");
        })
        .catch(err => {
            res.json({message: err.message, type: "danger"});
        });

});

router.get("/", (req, res) => {
    Manga.find().exec()
        .then(mangas => {
            res.render("index", {
                title: "Home-Page",
                mangas: mangas,
            });
        })
        .catch(err => {
            res.json({ message: err.message });
        });
});

router.get("/add", (req, res) => { 
    res.render("addmanga", { title: "Add Mangas" });
});

router.get("/edit/:id", (req, res) => {
    let id = req.params.id;
    Manga.findById(id)
      .then(manga => {
          if(!manga) {
              res.redirect("/");
          }else{
              res.render("editmanga", {
                  title: "Edit Manga",
                  manga: manga,
              });
          }
      })
      .catch(err => {
        console.log(err);
        res.redirect("/");
      });
  });

  router.post("/update/:id", uploadCover, async (req, res) => {
    let newcoverImg = "";
    
    if (req.file) {
        newcoverImg = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.oldcoverImg);
        } catch (err) {
            console.log(err);
        }
    } else {
        newcoverImg = req.body.oldcoverImg;
    }
    
    const updatedManga = {
        title: req.body.title,
        description: req.body.description,
        coverImg: newcoverImg
    };
    
    try {
        await Manga.findByIdAndUpdate(req.params.id, updatedManga, {new: true});
        
        req.session.message = {
            type: "success",
            message: "Manga updated successfully."
        };
        res.redirect("/");

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get("/delete/:id", async (req, res) => {
    try {
        let manga = await Manga.findById(req.params.id);
        if(manga.coverImg != ""){
            fs.unlinkSync("./uploads/"+manga.coverImg);
        }

        await Manga.findByIdAndDelete(req.params.id);
        req.session.message = {
            type: "info",
            message: "Manga deleted Successfully!"
        };
        res.redirect("/");
    } 
    catch(err){
        console.log(err);
        res.json({ message: err.message });
    }
});

module.exports = router;