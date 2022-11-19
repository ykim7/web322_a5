const Sequelize = require("sequelize");

var sequelize = new Sequelize(
    "yqqatpkm",
    "yqqatpkm",
    "c-wQwUBzCisA1aO2b6gicr4OGOpWsEeK",
    {
        host: "peanut.db.elephantsql.com",
        dialect: "postgres",
        port: 5432,
        dialectOptions: {
            ssl: { rejectUnauthorized: false },
        },
        query: { raw: true },
    }
);

sequelize
    .authenticate()
    .then(function () {
        console.log("Connection has been established successfully.");
    })
    .catch(function (err) {
        console.log("Unable to connect to the database:", err);
    });

var Student = sequelize.define("Student", {
    studentID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    phone: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    isInternationalStudent: Sequelize.BOOLEAN,
    expectedCredential: Sequelize.STRING,
    status: Sequelize.STRING,
    registrationDate: Sequelize.STRING,
});

var Program = sequelize.define("Program", {
    programCode: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    programName: Sequelize.STRING,
});

Program.hasMany(Student, { foreignKey: "program" });

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize
            .sync()
            .then(() => {
                resolve();
            })
            .catch(() => {
                reject("unable to sync the database");
            });
    });
};

module.exports.getAllstudents = () => {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then((students) => {
                resolve(students);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

module.exports.getInternationalStudents = () => {
    return new Promise((resolve, reject) => {
        const allIntStudents = students.filter(
            (stu) => stu.isInternationalStudent === true
        );
        if (allIntStudents.length == 0) {
            reject("no results returned");
            return;
        }
        resolve(allIntStudents);
    });
};

module.exports.getStudentsByStatus = (status) => {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                status: status,
            },
        })
            .then((students) => {
                resolve(students);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

module.exports.getStudentsByProgramCode = (program) => {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: { program: program },
        })
            .then((students) => {
                resolve(students);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};
module.exports.getStudentsByExpectedCredential = (credential) => {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                expectedCredential: credential,
            },
        })
            .then((students) => {
                resolve(students);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

module.exports.getStudentById = (sid) => {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                studentID: sid,
            },
        })
            .then((students) => {
                resolve(students[0]);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

module.exports.getPrograms = () => {
    return new Promise((resolve, reject) => {
        Program.findAll()
            .then((programs) => {
                resolve(programs);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

module.exports.addStudent = (studentData) => {
    return new Promise((resolve, reject) => {
        studentData.isInternationalStudent = studentData.isInternationalStudent
            ? true
            : false;

        for (var i = 0; i < studentData.length; i++) {
            if ((studentData[i] = "")) {
                studentData[i] = null;
            }
        }
        Student.create(studentData)
            .then((student) => {
                resolve(student);
            })
            .catch(() => {
                reject("unable to create student");
            });
    });
};

module.exports.updateStudent = (studentData) => {
    return new Promise(function (resolve, reject) {
        studentData.isInternationalStudent = studentData.isInternationalStudent
            ? true
            : false;

        for (var i = 0; i < studentData.length; i++) {
            if (studentData[i] === "") {
                studentData[i] = null;
            }
        }
        Student.update(studentData, {
            where: {
                studentID: studentData.studentID,
            },
        })
            .then((student) => {
                resolve(student);
            })
            .catch(() => {
                reject("unable to update student");
            });
    });
};

module.exports.deleteStudentById = (id) => {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: {
                studentID: id,
            },
        })
            .then(() => {
                resolve("destroyed");
            })
            .catch((err) => {
                reject(err);
            });
    });
};

module.exports.addProgram = (programData) => {
    return new Promise((resolve, reject) => {
        for (var i = 0; i < programData.length; i++) {
            if (programData[i] === "") {
                programData[i] = null;
            }
        }
        Program.create(programData)
            .then((program) => {
                resolve(program);
            })
            .catch(() => {
                reject("unable to create program");
            });
    });
};

module.exports.updateProgram = (programData) => {
    return new Promise((resolve, reject) => {
        for (var i = 0; i < programData.length; i++) {
            if (programData[i] === "") {
                programData[i] = null;
            }
        }
        Program.update(programData, {
            where: {
                programCode: programData.programCode,
            },
        })
            .then((program) => {
                resolve(program);
            })
            .catch(() => {
                reject("unable to update program");
            });
    });
};

module.exports.getProgramByCode = (pcode) => {
    return new Promise((resolve, reject) => {
        Program.findAll({
            where: {
                programCode: pcode,
            },
        })
            .then((programs) => {
                resolve(programs[0]);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
};

module.exports.deleteProgramByCode = (pcode) => {
    return new Promise((resolve, reject) => {
        Program.destroy({
            where: {
                programCode: pcode,
            },
        })
            .then(() => {
                resolve("destroyed");
            })
            .catch((err) => {
                reject(err);
            });
    });
};
