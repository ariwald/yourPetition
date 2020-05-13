// Constant Declarations and Imports
const express = require("express");
// to use express
const app = express();
// for the super test
exports.app = app;
//to use handlebars
const hb = require("express-handlebars");

const db = require("./db");

const cookieSession = require("cookie-session");

const csurf = require("csurf");

const {
    requireSignature,
    requireNoSignature,
    requireLoggedOutUser,
    requireLoggedInUser
} = require("./middleware");

let secrets;

if (process.env.NODE_ENV === "production") {
    secrets = process.env;
    console.log(process.env.SESSION_SECRET);
} else {
    secrets = require("./secrets");
}

//to hash the password and salt it
const bcrypt = require("./bcrypt");

// Express Configuration for express-handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Serving static files
app.use(express.static("./public"));

//Allow the access of req.body, otherwise req.body is empty
//// middleware function, that grabs user input, parses it and makes it available to req.body:
app.use(
    express.urlencoded({
        extended: false
    })
);

// Cookies
app.use(
    cookieSession({
        // secret: sessionSecret,
        secret: secrets.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

//we can use surf only after url and cookies
app.use(csurf());

//csurf middleware for security reasons
app.use(function(req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

//routes

//make a new get request = get /petition
app.get("/", (req, res) => {
    res.redirect("/petition");
});

// GET /register
// renders new register template
app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register", {
        layout: "main",
        loginB: true
    });
});

// POST /register
app.post("/register", requireLoggedOutUser, (req, res) => {
    bcrypt
        .hash(req.body.password)
        .then(password => {
            return db
                .userRegister(
                    req.body.name,
                    req.body.lastname,
                    req.body.email,
                    password
                )
                .then(data => {
                    let id = data.rows[0].id;
                    req.session.userId = id;
                    req.session.name = req.body.name;
                    req.session.lastname = req.body.lastname;
                    res.redirect("/profile");
                });
        })
        .catch(err => {
            console.log("err in Post register: ", err);
            res.render("register", {
                loginB: true,
                layout: "main",
                err: err
            });
        });
});

app.get("/profile", requireLoggedInUser, (req, res) => {
    let name = req.session.name;
    res.render("profile", {
        layout: "main",
        logoutB: true,
        name
    });
});

// POST /profile
app.post("/profile", requireLoggedInUser, (req, res) => {
    let url = req.body.url;
    if (!(url.startsWith("http://") || url.startsWith("https://"))) {
        url = "http://" + url;
    }
    console.log(req.body.url);
    db.insertProfile(req.body.age, req.body.city, url, req.session.userId)
        .then(() => {
            res.redirect("/petition");
        })
        .catch(err => {
            console.log("err in POST / profile: ", err);
            res.render("profile", {
                layout: "main",
                logoutB: true,
                err
            });
        });
}); //closes app.POST

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", {
        layout: "main",
        loginB: true
    });
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    let typedPassword = req.body.password;

    db.getUsersEmail(req.body.email)
        .then(results => {
            let userId = results[0].id;
            let userPassWord = results[0].password;
            let name = results[0].name;
            let lastname = results[0].lastname;

            bcrypt.compare(typedPassword, userPassWord).then(result => {
                console.log("it is a match: ", result);
                if (result) {
                    // if password correct:
                    req.session.userId = userId;
                    req.session.name = name;
                    req.session.lastname = lastname;

                    db.getSigId(userId)
                        .then(signatureId => {
                            req.session.signatureId = signatureId[0].id;
                            res.redirect("/thanks");
                        })
                        .catch(err => {
                            console.log("err in getSigID", err);
                            res.redirect("/petition");
                        });
                } else {
                    let loginErr = "wrong password or email!";
                    console.log(loginErr);
                    res.render("login", {
                        loginB: true,
                        loginErr
                    });
                }
            });
        })
        .catch(err => {
            console.log("err in /login: ", err);
            res.render("login", {
                loginB: true,
                err
            });
        });
});

////GET / petition
app.get("/petition", requireLoggedInUser, requireNoSignature, (req, res) => {
    let name = req.session.name;
    let lastname = req.session.lastname;

    res.render("petition", {
        layout: "main",
        logoutB: true,
        name,
        lastname
    });
});

app.post("/petition", requireNoSignature, (req, res) => {
    db.addInfo(req.session.userId, req.body.signature)
        .then(data => {
            let id = data.rows[0].id;
            req.session.signatureId = id;
            res.redirect("/thanks");
        })
        .catch(err => {
            console.log("Error in post: ", err);
            res.render("petition", {
                err
            });
        });
});

app.get("/thanks", requireLoggedInUser, requireSignature, (req, res) => {
    let signatureId = req.session.signatureId;
    db.getSignatures()
        .then(apple => {
            let numberOfApple = apple.length;
            db.getSignature(signatureId)
                .then(result => {
                    let sigUrl = result[0].signature;
                    res.render("thanks", {
                        layout: "main",
                        editB: true,
                        sigUrl,
                        numberOfApple
                    });
                })
                .catch(err => {
                    console.log("err in getSignatures: ", err);
                });
        })
        .catch(err => {
            console.log("err in getSigs in /thanks: ", err);
        });
});

//  GET /signatures
app.get("/signatures", requireLoggedInUser, requireSignature, (req, res) => {
    db.getInfo()
        .then(rows => {
            res.render("signatures", {
                logoutB: true,
                editB: true,
                rows
            });
        })
        .catch(err => {
            console.log("err in getInfo-signatures/get: ", err);
        });
});

//get signatures city
app.get(
    "/signatures/:city",
    requireLoggedInUser,
    requireSignature,
    (req, res) => {
        const city = req.params.city;
        db.getCity(city)
            .then(data => {
                res.render("city", {
                    layout: "main",
                    logoutB: true,
                    editB: true,
                    signatures: data.rows,
                    city: city
                });
            })
            .catch(err => {
                console.log("err in signnnCity in /signers/city: ", err);
            });
    }
);

app.get("/profile/edit", requireLoggedInUser, (req, res) => {
    let userId = req.session.userId;
    db.getProfile(userId)
        .then(profile => {
            profile = profile[0];
            res.render("profile_edit", {
                layout: "main",
                logoutB: true,
                profile
            });
        })
        .catch(err => {
            console.log("err in /profile/edit: ", err);
            res.render("profile_edit", {
                logoutB: true,
                err
            });
        });
});

app.post("/profile/edit", requireLoggedInUser, (req, res) => {
    let userId = req.session.userId;
    let url = req.body.url;
    if (!(url.startsWith("http://") || url.startsWith("https://"))) {
        url = "http://" + url;
    }
    if (req.body.password) {
        console.log("changed password");
        bcrypt.hash(req.body.password).then(password => {
            Promise.all([
                db.updateUser(
                    req.body.name,
                    req.body.lastname,
                    req.body.email,
                    password,
                    userId
                ),
                db.upsertProfile(req.body.age, req.body.city, url, userId)
            ])
                .then(() => {
                    console.log("changes :", changes);
                    let changes = "changes are ok";
                    res.render("profile_edit", {
                        logoutB: true,
                        changes
                    });
                })
                .catch(err => {
                    console.log(
                        "err in updateUser or upsertProfile.. editing stuff: ",
                        err
                    );
                    res.render("profile_edit", {
                        logoutB: true,
                        err
                    });
                });
        });
    } else {
        Promise.all([
            db.updateUserSame(
                req.body.name,
                req.body.lastname,
                req.body.email,
                userId
            ),
            db.upsertProfile(req.body.age, req.body.city, url, userId)
        ])
            .then(() => {
                let changes = "changes are ok";
                res.render("profile_edit", {
                    logoutB: true,
                    changes
                });
            })
            .catch(err => {
                console.log(
                    "err in updateUserSame or upsertProfile editing stuff: ",
                    err
                );
                res.render("profile_edit", {
                    logoutB: true,
                    err
                });
            });
    }
});

app.post(
    "/signature/delete",
    requireLoggedInUser,
    requireSignature,
    (req, res) => {
        db.deleteSignature(req.session.signatureId)
            .then(() => {
                delete req.session.signatureId;
                res.redirect("/petition");
            })
            .catch(err => {
                console.log("err in deleteSignature: ", err);
            });
    }
);

//logout deletes cookies
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

// listen to network port
app.listen(process.env.PORT || 8080, () => console.log("port 8080 listens"));
