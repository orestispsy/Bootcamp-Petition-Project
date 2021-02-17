const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.urlencoded({ extended: false })); //recognizes the incoming Request Object


app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    if (req.cookies.signed) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});


app.get("/thanks", (req, res) => {
        res.render("thanks", {
            layout: "main",
        })
});

app.get("/signers", (req, res) => {
        db.getAllSignatures()
            .then(({ rows }) => {
                console.log("rows:", rows);
                res.render("signers", {
                    layout: "main",
                    rows,
                });
            })
            .catch((err) => console.log(err));
});


app.post("/", (req, res) => {
    if (req.body.firstname && req.body.lastname) {
        res.cookie("signed", "true");
        res.redirect("/thanks");
        console.log("req.body: ", req.body);
        db.addSignatures(`"${req.body.firstname}"`, `"${req.body.lastname}"`)
            .then(({ rows }) => {
                console.log("rows: ", rows);
            })
            .catch((err) => console.log(err));
    } else {
        res.redirect("/")
    }
});


const server = app.listen(8080, () =>
    console.log(
        `🟢 Listening Port ${
            server.address().port
        } ... ~ Petition ~`
    )
);