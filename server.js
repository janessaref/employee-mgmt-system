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
        choices: ["View All Employees", "View All Employees by Department", "View All Employees by Manager", "Add Employee", "Add Department", "Add Role", "Remove Employee", "Update Employee Role", "Update Employee Manager", "View All Roles", "Quit"]
    }]).then(function(data) {
        switch (data.action) {
            case "View All Employees":
                employeesTable();
                break;
            case "View All Employees by Department":
                employeesDeptTable();
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
            console.table(res);
            return res;
        })
};

function employeesDeptTable() {
    connection.query(
        `
        SELECT 
            id,
            department_name AS Department

        FROM departments
        `,
        function(err, res) {
            if (err) throw err;
            console.table(res);
            return res;
        })
};

function employeesManagerTable() {
    console.log("table for managers");
};

function addEmployee() {
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
            type: "input",
            name: "role",
            message: "What is the employee's role?",
        },
        {
            type: "input",
            name: "manager",
            message: "What is the employee's manager?",
        },
    ]).then(function(data) {
        connection.query(
            "INSERT INTO employees SET ?", {
                first_name: data.firstname,
                last_name: data.lastname,
                role_id: data.role,
                manager_id: data.manager,
            },
            function(err, res) {
                if (err) throw err;
                console.log(`Added ${res.first_name} ${res.last_name} to the database`);
                // re-prompt the user the first prompt
                begin();
            },
        );
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