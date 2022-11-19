/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part
 *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Yujin Kim / Student ID: ykim296 / Date: 2022 Nov 18
 *
 *  Online (Cyclic) Link: https://tame-toad-sunbonnet.cyclic.app
 *
 ********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;

var express = require("express");
var multer = require("multer");
var app = express();
const path = require("path");
const fs = require("fs");
const dataService = require("./data-service.js");
const exphbs = require("express-handlebars");

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.engine(
    ".hbs",
    exphbs.engine({
        extname: ".hbs",
        defaultLayout: "main",
        helpers: {
            navLink: function (url, options) {
                return (
                    "<li" +
                    (url == app.locals.activeRoute ? ' class="active" ' : "") +
                    '><a href="' +
                    url +
                    '">' +
                    options.fn(this) +
                    "</a></li>"
                );
            },
            equal: function (lvalue, rvalue, options) {
                if (arguments.length < 3)
                    throw new Error(
                        "Handlebars Helper equal needs 2 parameters"
                    );
                if (lvalue != rvalue) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            },
        },
    })
);
app.set("view engine", ".hbs");

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
    next();
});

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/students", (req, res) => {
    if (req.query.status) {
        const status = req.query.status;
        dataService
            .getStudentsByStatus(status)
            .then((data) => {
                if (data.length > 0) res.render("students", { students: data });
                else res.render("students", { message: "no results" });
            })
            .catch((err) => {
                res.render("students", { message: "no results" });
            });
    } else if (req.query.program) {
        const program = req.query.program;
        dataService
            .getStudentsByProgramCode(program)
            .then((data) => {
                if (data.length > 0) res.render("students", { students: data });
                else res.render("students", { message: "no results" });
            })
            .catch((err) => {
                res.render("students", { message: "no results" });
            });
    } else if (req.query.credential) {
        const credential = req.query.credential;
        dataService
            .getStudentsByExpectedCredential(credential)
            .then((data) => {
                if (data.length > 0) res.render("students", { students: data });
                else res.render("students", { message: "no results" });
            })
            .catch((err) => {
                res.render("students", { message: "no results" });
            });
    } else {
        dataService
            .getAllstudents()
            .then((data) => {
                if (data.length > 0) res.render("students", { students: data });
                else res.render("students", { message: "no results" });
            })
            .catch((err) => {
                res.render("students", { message: "no results" });
            });
    }
});

app.get("/student/:studentId", function (req, res) {
    // initialize an empty object to store the values
    let viewData = {};

    dataService
        .getStudentById(req.params.studentId)
        .then((data) => {
            if (data) {
                viewData.student = data; //store student data in the "viewData" object as "student"
            } else {
                viewData.student = null; // set student to null if none were returned
            }
        })
        .catch(() => {
            viewData.student = null; // set student to null if there was an error
        })
        .then(dataService.getPrograms)
        .then((data) => {
            viewData.programs = data; // store program data in the "viewData" object as "programs"

            // loop through viewData.programs and once we have found the programCode that matches
            // the student's "program" value, add a "selected" property to the matching
            // viewData.programs object

            for (let i = 0; i < viewData.programs.length; i++) {
                if (
                    viewData.programs[i].programCode == viewData.student.program
                ) {
                    viewData.programs[i].selected = true;
                }
            }
        })
        .catch(() => {
            viewData.programs = []; // set programs to empty if there was an error
        })
        .then(() => {
            if (viewData.student == null) {
                // if no student - return an error
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData }); // render the "student" view
            }
        })
        .catch((err) => {
            res.status(500).send("Unable to Show Students");
        });
});

app.get("/students/add", (req, res) => {
    dataService
        .getPrograms()
        .then((programs) => {
            res.render("addStudent", { programs: programs });
        })
        .catch(() => {
            res.render("addStudent", { programs: [] });
        });
});

app.post("/students/add", (req, res) => {
    dataService
        .addStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch((err) => {
            console.log("Error: ", err);
        });
});

app.post("/student/update", (req, res) => {
    dataService
        .updateStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch((err) => {
            res.render("students", { message: "no results" });
        });
});

app.get("/students/delete/:studentID", function (req, res) {
    dataService
        .deleteStudentById(req.params.studentID)
        .then(() => {
            res.redirect("/students");
        })
        .catch((err) => {
            res.status(500).send(
                "Unable to Remove Student / Student not found)"
            );
        });
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/images/add", (req, res) => {
    res.render("addImage");
});

app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", function (err, items) {
        res.render("images", { data: items });
    });
});

app.get("/intlstudents", (req, res) => {
    dataService
        .getInternationalStudents()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.send(err);
        });
});

app.get("/programs", (req, res) => {
    dataService
        .getPrograms()
        .then((data) => {
            if (data.length > 0) res.render("programs", { programs: data });
            else res.render("programs", { message: "no results" });
        })
        .catch((err) => {
            res.render("programs", { message: "no results" });
        });
});

app.get("/programs/add", (req, res) => {
    res.render("addProgram");
});

app.post("/programs/add", (req, res) => {
    dataService
        .addProgram(req.body)
        .then(() => {
            res.redirect("/programs");
        })
        .catch((err) => {
            console.log("Error: ", err);
        });
});

app.post("/program/update", (req, res) => {
    dataService
        .updateProgram(req.body)
        .then((data) => {
            console.log("here!");
            res.redirect("/programs");
        })
        .catch((err) => {
            res.render("programs", { message: "no results" });
        });
});

app.get("/program/:programCode", function (req, res) {
    var pcode = req.params.programCode;
    dataService
        .getProgramByCode(pcode)
        .then((data) => {
            if (data) res.render("program", { program: data });
            else res.status(404).send("Program Not Found");
        })
        .catch((err) => {
            res.status(404).send("Program Not Found");
        });
});

app.get("/programs/delete/:programCode", function (req, res) {
    dataService
        .deleteProgramByCode(req.params.programCode)
        .then(() => {
            res.redirect("/programs");
        })
        .catch((err) => {
            res.status(500).send(
                "Unable to Remove Program / Program not found)"
            );
        });
});

app.use((req, res) => {
    res.status(404).send("<h2>404</h2><p>Page Not Found</p>");
});

dataService
    .initialize()
    .then(() => {
        app.listen(HTTP_PORT, onHttpStart);
    })
    .catch((err) => {
        console.log("Error: ", err);
    });
