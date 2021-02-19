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

app.use(express.urlencoded({ extended: false }));

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

app.post("/", (req, res) => {
    if (req.body.signature) {
        console.log("req.body: ", req.body);
        db.addSignatures(`${req.body.signature}`)
            .then(({ rows }) => {
                req.session.signatureId = rows[0].id;
                console.log("ID IS:", req.session.signatureId);
                res.redirect("/thanks");
                console.log("rows: ", rows);
            })
            .catch((err) => console.log(err));
    } else {
        res.render("petition", {
            layout: "main",
            error: true,
            errorMessage: "* * * Please provide a Signature * * *",
        });
    }
});

app.get("/register", (req, res) => {
    res.render("registration", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    if (req.body.firstname && req.body.lastname && req.body.email && req.body.password) {
        hash(req.body.password).then((password_hash) => {
           db.addRegistration(
               `${req.body.firstname}`,
               `${req.body.lastname}`,
               `${req.body.email}`,
               `${password_hash}`
           )
               .then(({ rows }) => {
                   req.session.userId = rows[0].id;
                   console.log("ID IS:", req.session.userId);
                   res.redirect("/");
                   console.log("rows: ", rows);
               })
               .catch((err) => console.log(err));
        });
        // console.log("req.body: ", req.body);
        // db.addSignatures(`${req.body.signature}`)
        //     .then(({ rows }) => {
        //         req.session.signatureId = rows[0].id;
        //         console.log("ID IS:", req.session.signatureId);
        //         res.redirect("/thanks");
        //         console.log("rows: ", rows);
        //     })
        //     .catch((err) => console.log(err));
    } else {
        res.render("registration", {
            layout: "main",
            error: true,
            errorMessage: "* * * Please provide all information * * *",
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
                   compare(
                       req.body.password,
                       rows[0].password_hash
                   )
                       .then((match) => {
                           if (match) {
                                res.redirect("/");
                           } else {
                                  res.render("login", {
                                      layout: "main",
                                      error: true,
                                      errorMessage:
                                          "* * * We cannot find such an Email or Password, please try again * * *",
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
            errorMessage: "* * * Please provide all information * * *",
        });
    }
});

app.get("/thanks", (req, res) => {
    db.getSignatureId(req.session.signatureId)
        .then(({ rows }) => {
            // console.log("SIGNATURE IS", rows[0].signature);
            res.render("thanks", {
                layout: "main",
                thisSignature: rows[0].signature,
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
                rows,
            });
        })
        .catch((err) => console.log(err));
});


const server = app.listen(8080, () =>
    console.log(`🟢 Listening Port ${server.address().port} ... ~ Petition ~`)
);
