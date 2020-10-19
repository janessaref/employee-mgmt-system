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

let connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "codIng9!",
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
        choices: ["View All Employees", "View All Employees by Department", "View All Employees by Manager", "Add Employee", "Remove Employee", "Update Employee Role", "Update Employee Manager", "View All Roles"]
    }]).then(function(data) {

        if (data.action === "View All Employees") {
            employeesTable();
        } else if (data.action === "View All Employees by Department") {
            employeesDeptTable();
        } else if (data.action === "View All Employees by Manager") {
            employeesManagerTable();
        }



    });
};

function employeesTable() {
    console.log("test if it works");
};

function employeesDeptTable() {
    console.log("table for department");
};

function employeesManagerTable() {
    console.log("table for managers");
};