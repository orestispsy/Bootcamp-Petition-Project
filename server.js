const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const secure = require("express-force-https"); //////

const { hash, compare } = require("./utils/bc.js");

const cookieSession = require("cookie-session");
// const csurf = require("csurf");

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

app.use(secure);

// app.use(csurf()); 

// app.use(function(req, res, next) {
//     res.locals.csrfToken = req.csrfToken();
//     next();
// });


app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/register", (req, res) => {
    if (req.session.user_id) {
        res.redirect("/petition");
    } else {
       res.render("registration", {
           layout: "main",
       });
    }
    
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
                    console.log("THE ROWS ARE", rows);
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
    if (req.session.user_id) {
        res.redirect("/petition")
    } else{
    res.render("login", {
        layout: "main",
    });
}
});

app.post("/login", (req, res) => {
    if (req.body.email && req.body.password) {
        db.getPasswordHashed(req.body.email)
            .then(({ rows }) => {
                console.log("here you go", rows);
                if (rows.length === 0) {
                    res.render("login", {
                        layout: "main",
                        error: true,
                        errorMessage:
                            "* We cannot find such an Email or Password, please try again *",
                    });
                }
                compare(req.body.password, rows[0].password_hash)
                    .then((match) => {
                        if (match) {
                            req.session.user_id = rows[0].id;
                            console.log("COOKIE USER ID", req.session.user_id);
                            db.getLoginSignature(rows[0].id)
                                .then(({ rows }) => {
                                    console.log("LOGIN ROWS!", rows);
                                    if (rows.length === 0) {
                                        res.redirect("/petition");
                                    } else {
                                        console.log(rows[0].id);
                                        req.session.signatureId = rows[0].id;
                                        console.log(
                                            "COOKIE SIGNATURE ID",
                                            req.session.signatureId
                                        );
                                        res.redirect("/thanks");
                                    }
                                })
                                .catch((err) => console.log(err));
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
    if (req.session.user_id) {
       res.render("profile", {
           layout: "main",
       });
    } else {
        res.redirect("/login");
    }
});

app.post("/profile", (req, res) => {
    console.log("AGE IS", req.body.age);
    if (req.body.age == "") {
        req.body.age = null;
    }
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
    } else if (req.session.user_id) {
        res.render("petition", {
            layout: "main",
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/petition", (req, res) => {
    if (req.body.signature) {
        db.addSignatures(req.session.user_id, `${req.body.signature}`)
            .then(({ rows }) => {
                req.session.signatureId = rows[0].id;
                console.log(
                    "Petition SIGNATURE id IS",
                    req.session.signatureId
                );
                console.log("PETITION ROWS", rows);
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
        if (req.session.signatureId) {
            db.getSignature(req.session.signatureId)
                .then(({ rows }) => {
                    console.log("thanks ROWS", rows);
                    res.render("thanks", {
                        layout: "main",
                        thisSignature: rows[0].signature,
                    });
                })
                .catch((err) => console.log(err));
        } else {
            res.redirect("/petition");
        }
});

app.post("/thanks", (req, res) => {  
            db.deleteSignature(req.session.user_id)
                .then(() => {
                    req.session.signatureId = null;
                    console.log("DELETED SIGNATURE", req.session.signatureId);
                    res.redirect("/petition");
                })
                .catch((err) => console.log(err));
            
      
});

app.get("/signers", (req, res) => {
    if (req.session.signatureId) {
        db.getAllSigners()
            .then(({ rows }) => {
                for (let i = 0; i < rows.length; i++) {
                    if (
                        !rows[i].homepage.includes("http://") &&
                        !rows[i].homepage.includes("https://")
                    ) {
                        rows[i].homepage = "javascript:;";
                    }
                }
                console.log("signers rows:", rows);
                res.render("signers", {
                    layout: "main",
                    rows,
                });
            })
            .catch((err) => console.log(err));
    } else {
        res.redirect("/petition");
    }
});


app.get("/profile/edit", (req, res) => {
    if (req.session.signatureId) {
        db.getUserToEdit(req.session.user_id)
            .then(({ rows }) => {
                console.log("EDITING rows:", rows);
                res.render("edit", {
                    layout: "main",
                    rows,
                });
            })
            .catch((err) => console.log(err));
    } else {
        res.redirect("/petition");
    }
});

app.post("/profile/edit", (req, res) => {  
    db.getUserToEdit(req.session.user_id)
        .then(({ rows }) => {
            if (req.body.password) {
                hash(req.body.password).then((password_hash) => {
                    db.updateUserLogin(
                        req.body.firstname,
                        req.body.lastname,
                        req.body.email,
                        password_hash,
                        req.session.user_id
                    ).catch((err) => console.log(err));
                });
            } else {
                console.log("UPDATE LOGIN rows:", rows);
                db.updateUserLogin(
                    req.body.firstname,
                    req.body.lastname,
                    req.body.email,
                    rows[0].password_hash,
                    req.session.user_id
                )
                .catch((err) => console.log(err));
            }
            db.updateUserProfile(
                req.body.age,
                req.body.city,
                req.body.homepage,
                req.session.user_id
            )
            .catch((err) => console.log(err));
        })
        .then(() => {
            console.log(req.session.user_id);
            res.redirect("/thanks");
        })
        .catch((err) => console.log(err));
});

app.get("/signers/:city", (req, res) => {
    if (req.session.signatureId) {
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
    } else {
        res.redirect("/petition");
    }
});

app.get("/logout", (req, res) => {
            req.session = null;
            res.redirect("/")
});

const server = app.listen(process.env.PORT || 8080, () =>
    console.log(`🟢 Listening Port ${server.address().port} ... ~ Petition ~`)
);
