const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");

const { hash, compare } = require("./utils/bc.js");

const cookieSession = require("cookie-session");

app.use(
    cookieSession({
        secret: `O Brother, Where @rt Thou?`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.redirect("/login")
});

app.get("/register", (req, res) => {
    res.render("registration", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    if (
        req.body.firstname &&
        req.body.lastname &&
        req.body.email &&
        req.body.password
    ) {
        hash(req.body.password).then((password_hash) => {
                 db.addRegistration(
                `${req.body.firstname}`,
                `${req.body.lastname}`,
                `${req.body.email}`,
                `${password_hash}`
            )
                .then(({ rows }) => {
                    console.log("THE ROWS ARE", rows)
                    req.session.user_id = rows[0].id;
                    console.log("ID IS:", req.session.user_id);
                    res.redirect("/profile");
                    console.log("rows: ", rows);
                })
                .catch((err) => console.log(err));
        });
    } else {
        res.render("registration", {
            layout: "main",
            error: true,
            errorMessage: "* Please provide all information *",
        });
    }
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    if (req.body.email && req.body.password) {
        db.getPasswordHashed(req.body.email)
            .then(({ rows }) => {
                compare(req.body.password, rows[0].password_hash)
                    .then((match) => {
                        if (match) {
                            res.redirect("/petition");
                        } else {
                            res.render("login", {
                                layout: "main",
                                error: true,
                                errorMessage:
                                    "* We cannot find such an Email or Password, please try again *",
                            });
                        }
                    })
                    .catch((err) => console.log(err));
              
            })
            .catch((err) => console.log(err));
    } else {
        res.render("login", {
            layout: "main",
            error: true,
            errorMessage: "* Please provide all information *",
        });
    }
});

app.get("/profile", (req, res) => {
    res.render("profile", {
    layout: "main",
    });
});

app.post("/profile", (req, res) => {
    db.addUserProfile(
        req.body.age,
        req.body.city,
        req.body.homepage,
        req.session.user_id
    )
        .then(({ rows }) => {
            res.redirect("/petition");
        })
        .catch((err) => console.log(err));
});

app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});

app.post("/petition", (req, res) => {
    if (req.body.signature) {
        db.addSignatures(req.session.user_id, `${req.body.signature}`)
            .then(({ rows }) => {
                req.session.signatureId = rows[0].id;
                console.log("Petition SIGNATURE id IS", req.session.signatureId);
                res.redirect("/thanks");
            })
            .catch((err) => console.log(err));
    } else {
        res.render("petition", {
            layout: "main",
            error: true,
            errorMessage:
                "* Draw a Signature on the Canvas below for your support to count ! *",
        });
    }
});

app.get("/thanks", (req, res) => {
   
        db.getSignature(req.session.signatureId)
            .then(({ rows }) => {
                console.log("thanks ROWS", rows);
                res.render("thanks", {
                    layout: "main",
                    thisSignature: rows[0].signature,
                });
            })
            .catch((err) => console.log(err));
});

app.get("/signers", (req, res) => {
    db.getAllSigners()
        .then(({ rows }) => {
            console.log("signers rows:", rows);
            res.render("signers", {
                layout: "main",
                rows,
            });
        })
        .catch((err) => console.log(err));
});

app.get("/signers/:city", (req, res) => {
    console.log("city :", req.params.city);
    db.getAllSignersByCity(req.params.city)
        .then(({ rows }) => {
            console.log("signers city rows:", rows);
            res.render("signers", {
                layout: "main",
                rows,
                city: req.params.city,
            });
        })
        .catch((err) => console.log(err));
});

const server = app.listen(8080, () =>
    console.log(`🟢 Listening Port ${server.address().port} ... ~ Petition ~`)
);
