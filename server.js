/*
three main tables:
1. by department
    - id (primary key)
    - department name
2. by role
    - id (primary key)
    - role title
    - salary in decimal
    - department_id -- reference to dept role belonging to
3. by employee
    - id (primary key)
    - first name
    - last name
    - role_id -- reference to employee role
    - manager_id -- reference to manager, can be null if employee has no manager

Features:
1. add dempartment, role, employee
2. view department, role, employee
3. update employee roles

Additional features:
1. update employee managers
2. view employees by manager
3. delete departments, roles, and employees
4. view total utilized budget of a department -- combined salaries in the dept

Steps to create:
1. install dependencies mysql and inquirer and console.table
2. create connection 
3. build mysql starter template table in seed.sql
3. create prompts for each table
*/

// dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
const consoletable = require("console.table");
const chalk = require("chalk");

const connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "jerrifong",

    password: "mepassword",
    database: "employeeMgmt_DB"
});

connection.connect(function(err) {
    if (err) throw err;
    begin();

});

function begin() {
    inquirer.prompt([{
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: ["View All Employees", "View All Departments", "View All Roles", "View All Employees by Manager", "Add Employee", "Add Department", "Add Role", "Remove Employee", "Update Employee Role", "Update Employee Manager", "Quit"]
    }]).then(function(data) {
        switch (data.action) {
            case "View All Employees":
                employeesTable();
                break;
            case "View All Departments":
                departmentsTable();
                break;
            case "View All Employees by Manager":
                employeesManagerTable();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Add Role":
                addRole();
                break;
            case "Remove Employee":
                removeEmployee();
                break;
            case "Update Employee Role":
                updateRole();
                break;
            case "Update Employee Manager":
                updateManager();
                break;
            case "View All Roles":
                rolesTable();
                break;
            case "Quit":
                console.log("Bye bye!")
                connection.end();
        };
    });
};

function employeesTable() {
    connection.query(
        `
         SELECT
            e.id, 
            e.first_name AS First,
            e.last_name AS Last,
            r.title AS Title,
            d.department_name AS Department,
            r.salary AS Salary,
            CONCAT(m.first_name, " ",m.last_name) AS Manager


        FROM employees e 
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN departments d ON r.department_id = d.id
        LEFT JOIN employees m ON e.manager_id = m.id
        ORDER BY e.id
        `,
        function(err, res) {
            if (err) throw err;
            console.table("\n", res);
            return res;
        });
    begin();
};

function departmentsTable() {
    connection.query(
        `
        SELECT 
            id AS ID,
            department_name AS Department

        FROM departments
        `,
        function(err, res) {
            if (err) throw err;
            console.table("\n", res);
            return res;
        });
    begin();
};

// function employeesManagerTable() {
//     connection.query(
//         `SELECT 
//             * 
//             CONCAT(m.first_name, " ",m.last_name) AS Manager
//         FROM employees 

//         `,
//         function(err, res) {
//             if (err) throw err;
//             console.table(res);
//             return res;
//         },
//     );
// };

function addEmployee() {
    connection.query(
        "SELECT title FROM roles",
        function(err, res) {
            if (err) throw err;
            inquirer.prompt([{
                    type: "input",
                    name: "firstname",
                    message: "What is the employee's first name?",
                },
                {
                    type: "input",
                    name: "lastname",
                    message: "What is the employee's last name?",
                },
                {
                    type: "list",
                    name: "role",
                    message: "What is the employee's role?",
                    choices: function() {
                        let roleArray = [];
                        for (let i = 0; i < res.length; i++) {
                            roleArray.push(res[i].title);
                        };
                        return roleArray;
                    },
                },
            ]).then(function(data) {
                let firstName = data.firstname;
                let lastName = data.lastname;
                let employeeRole = data.role;
                employeeManager(firstName, lastName, employeeRole);
            });
        });
};


function employeeManager(first, last, role) {
    connection.query("SELECT * FROM employees LEFT JOIN roles ON employees.role_id = roles.id ORDER BY employees.id", [first, last, role], function(err, res) {
        console.table(res);

        inquirer.prompt({
            type: "list",
            name: "manager",
            message: "Who is the employee's manager?",
            choices: function() {
                let managerArray = ["I am the Manager"];
                for (let i = 0; i < res.length; i++) {
                    if (res[i].manager_id === null) {
                        managerArray.push(`${res[i].first_name} ${res[i].last_name}`);
                    };
                };
                return managerArray;
            },
        }).then(function(data) {
            let roleId;
            for (let i = 0; i < res.length; i++) {
                if (res[i].title === role) {
                    roleId = res[i].id;
                };
            };

            let managerId;
            for (let j = 0; j < res.length; j++) {
                let fullName = res[j].first_name + " " + res[j].last_name;
                console.log(fullName);
                if (fullName === data.manager) {
                    managerId = res[j].id;
                } else if (data.manager === "I am the Manager") {
                    managerId = null;
                };
            };

            connection.query(
                "INSERT INTO employees SET ?", {
                    first_name: first,
                    last_name: last,
                    role_id: roleId,
                    manager_id: managerId
                },
                function(err, res) {
                    return res;
                });
            begin();
        });
    });
};

function addDepartment() {
    connection.query("SELECT * FROM departments", (err, res) => {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.table(`${res[i].department_name}`);
        };
        inquirer.prompt({
            type: "input",
            name: "department",
            message: "Add a new department:"
        }).then(function(data) {
            connection.query(
                "INSERT INTO departments SET ?", {
                    department_name: data.department
                },
                console.log(chalk.yellow(`Added ${data.department} to the database!`)),
                function(err, res) {
                    if (err) throw err;
                    return res;
                });
            begin();
        });
    });
};

function addRole() {
    connection.query("SELECT * FROM roles", (err, res) => {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.table(`${res[i].title}`);
        };
        inquirer.prompt([{
            type: "input",
            name: "role",
            message: "Add a new role:"
        }, {
            type: "number",
            name: "salary",
            message: "Enter the salary of this role:"
        }]).then(function(data) {
            let newRole = data.role;
            let newSalary = data.salary;
            roleDepartment(newRole, newSalary);
            // connection.query(
            //     "INSERT INTO roles SET ?", {
            //         title: data.role
            //     },
            //     function(err, res) {
            //         console.log(`Added ${res.title} to the database`);
            //         begin();
            //     }
            // )
        });
    });
};

function roleDepartment(role, salary) {
    connection.query("SELECT * FROM departments", [role, salary], (err, res) => {
        if (err) throw err;
        inquirer.prompt({
            type: "list",
            name: "department",
            message: "Select the department for this role:",
            choices: function() {
                let deptArray = [];
                for (let i = 0; i < res.length; i++) {
                    deptArray.push(res[i].department_name);
                };
                return deptArray;
            }
        }).then(function(data) {
            let deptId;
            for (let i = 0; i < res.length; i++) {
                if (res[i].department_name === data.department) {
                    deptId = res[i].id;
                };
            };
            connection.query(
                "INSERT INTO roles SET ?", {
                    title: role,
                    salary: salary,
                    department_id: deptId
                },
                console.log(`Added ${role} to the database!`),
                function(err, res) {
                    if (err) throw err;
                    return res;
                });
            begin();
        });
    });
};

function rolesTable() {
    connection.query(
        `
        SELECT
        id AS ID, 
        title AS Title,
        salary AS Salary

       FROM roles
        `,
        function(err, res) {
            if (err) throw err;
            console.table("\n", res);
            return res;
        });
    begin();
};

function updateRole() {
    connection.query("SELECT first_name AS First, last_name AS Last, title AS Title, role_id AS Role_ID FROM employees LEFT JOIN roles ON employees.role_id = roles.id", function(err, res) {
        if (err) throw err;
        console.table(res);
        inquirer.prompt([{
                type: "list",
                name: "employee",
                message: "Select an employee to update role",
                choices: function() {
                    let employeeArray = [];
                    for (let i = 0; i < res.length; i++) {
                        employeeArray.push(`${res[i].First} ${res[i].Last}`);
                    };
                    return employeeArray;
                },
            },
            {
                type: "list",
                name: "updaterole",
                message: "Select the role",
                choices: function() {
                    let roleArray = [];
                    for (let i = 0; i < res.length; i++) {
                        roleArray.push(res[i].Title);
                    };
                    return roleArray;
                },
            },
        ]).then((data) => {
            let name = data.employee.split(" ");

            let employeefirstName = name[0];
            let employeelastName = name[1];

            let updateroleId;
            for (let i = 0; i < res.length; i++) {
                if (res[i].Title === data.updaterole) {
                    updateroleId = res[i].Role_ID;
                };
            };

            connection.query("UPDATE employees SET ? WHERE ? AND ?", [{
                    role_id: updateroleId,
                }, {
                    first_name: employeefirstName,

                }, {
                    last_name: employeelastName
                }],
                console.log(chalk.yellow(`Employee ${employeefirstName} ${employeelastName} role has been updated!`)),
                (err, res) => {
                    if (err) throw err;
                    return res;
                });
            begin();
        });
    });
};

// const DB = {
//     findAllEmployees() {
//         connection.query(
//             `
//             SELECT * FROM employees
//             `,
//             function(err, res) {
//                 if (err) throw err;
//                 console.log(res);
//                 return res;
//             })
//     },
// }

// findAllEmployees() {
//     return connection.query(
//         `
//         SELECT
//             e.id, 
//             e.first_name AS First,
//             e.last_name AS Last,
//             r.title AS Title,
//             d.department_name AS Department,
//             r.salary AS Salary,
//             CONCAT(m.first_name, " ",m.last_name) AS Manager


//         FROM employees e 
//         LEFT JOIN roles r ON e.role_id = r.id
//         LEFT JOIN departments d ON r.department_id = d.id
//         LEFT JOIN employees m ON e.manager_id = m.id
//         ORDER BY e.id
//         `
//     )
// },