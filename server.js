const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");

var cookieSession = require("cookie-session");

app.use(
    cookieSession({
        secret: `O Brother, Where @rt Thou?`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.urlencoded({ extended: false })); //recognizes the incoming Request Object


app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
        if (req.session.signatureId) {           
            res.redirect("/thanks");
        } else {
            res.render("petition", {
                layout: "main",
            });
        }
});


app.get("/thanks", (req, res) => {
    db.getSignatureId(req.session.signatureId)
        .then(({ rows }) => {
            console.log("SIGNATURE IS", rows[0].signature);
            res.render("thanks", {
                layout: "main",
                signature: rows[0].signature
            });
        })
        .catch((err) => console.log(err));
        
});

app.get("/signers", (req, res) => {
        db.getAllSignatures()
            .then(({ rows }) => {
                console.log("rows:", rows);
                res.render("signers", {
                    layout: "main",
                    rows
                });
            })
            .catch((err) => console.log(err));
});


app.post("/", (req, res) => {
    if (req.body.firstname && req.body.lastname && req.body.signature) {
        
        console.log("req.body: ", req.body);
        db.addSignatures(
            `"${req.body.firstname}"`,
            `"${req.body.lastname}"`,
            `"${req.body.signature}"`
        )
            .then(({ rows }) => {
                req.session.signatureId = rows[0].id;
                console.log("ID IS:", req.session.signatureId);
                res.redirect("/thanks");
                console.log("rows: ", rows);
            })
            .catch((err) => console.log(err));
    } else {
        res.redirect("/");
    }
});


const server = app.listen(8080, () =>
    console.log(
        `🟢 Listening Port ${
            server.address().port
        } ... ~ Petition ~`
    )
);