/*
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

// connecting to mysql database
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

// starting prompt to ask user what action to take
function begin() {
    inquirer.prompt([{
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: ["View All Employees", "View All Departments", "View All Roles", "Add Employee", "Add Department", "Add Role", "Remove Employee", "Remove A Department", "Remove A Role", "Update Employee Role", "Quit"]
    }]).then(function(data) {
        switch (data.action) {
            case "View All Employees":
                employeesTable();
                break;
            case "View All Departments":
                departmentsTable();
                break;
            case "View All Roles":
                rolesTable();
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
            case "Remove A Department":
                removeDepartment();
                break;
            case "Remove A Role":
                removeRole();
                break;
            case "Update Employee Role":
                updateRole();
                break;
            case "Quit":
                console.log(chalk.green("Bye bye!"));
                connection.end();
        };
    });
};

// function that views the employees table
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

// function that views the departments table
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

// function that displays the roles table
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

// function that lets user add new employees to the database
function addEmployee() {
    connection.query("SELECT title FROM roles",
        function(err, res) {
            if (err) throw err;

            // prompts for the users inputs on new employee information
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
                    // choices are grabbed from the database to be displayed
                    choices: function() {
                        let roleArray = [];
                        for (let i = 0; i < res.length; i++) {
                            roleArray.push(res[i].title);
                        };
                        return roleArray;
                    },
                },
            ]).then(function(data) {
                // data from the user's inputs set into variables
                let firstName = data.firstname;
                let lastName = data.lastname;
                let employeeRole = data.role;

                // calls this function and passes in the user's inputs
                employeeManager(firstName, lastName, employeeRole);
            });
        });
};

// function that the user selects the employee's manager
function employeeManager(first, last, role) {
    // query to display a table with the managers and the departments so that the user is aware from what department each manager is from
    connection.query("SELECT employees.id AS ID, first_name AS First, last_name AS Last, title AS Title, department_name AS Department, role_id AS Role_ID, manager_id AS Manager_ID FROM employees LEFT JOIN roles ON (employees.role_id = roles.id) LEFT JOIN departments ON (roles.department_id = departments.id) ORDER BY employees.id", [first, last, role],
        function(err, res) {
            if (err) throw err;
            console.table(res);

            // query used to grab id information from the roles table that will be used for the .then function to update employees role_id
            connection.query("SELECT * FROM roles", [first, last, role],
                function(err, resRole) {
                    if (err) throw err;

                    // prompts user to select a manager and can easily choose who the manager is because of the table displayed with the departments and manager names
                    inquirer.prompt({
                        type: "list",
                        name: "manager",
                        message: "Who is the employee's manager?",
                        choices: function() {
                            let managerArray = ["I am the Manager"];
                            for (let i = 0; i < res.length; i++) {
                                if (res[i].Manager_ID === null) {
                                    managerArray.push(`${res[i].First} ${res[i].Last}`);
                                };
                            };
                            return managerArray;
                        },
                    }).then(function(data) {

                        // user's selected input for role will equate to the role's id 
                        let roleId;
                        for (let i = 0; i < resRole.length; i++) {
                            if (resRole[i].title === role) {
                                roleId = resRole[i].id;
                            }
                        };

                        // user's selected manager input will equate to the manager's id
                        let managerId;
                        for (let j = 0; j < res.length; j++) {
                            // combines first and last name inputs into fullName variable
                            let fullName = res[j].First + " " + res[j].Last;

                            if (fullName === data.manager) {
                                managerId = res[j].ID;
                            } else if (data.manager === "I am a Manager") {
                                managerId = null;
                            }
                        };

                        // Inserts and sets the new information into the database
                        connection.query(
                            "INSERT INTO employees SET ?", {
                                first_name: first,
                                last_name: last,
                                role_id: roleId,
                                manager_id: managerId
                            },
                            console.log(chalk.yellow(`Added employee ${first} ${last} to the database!`)),
                            function(err, res) {
                                if (err) throw err;
                                return res;
                            });
                        begin();
                    });
                });
        });
};

// function that allows user to add departments to the database
function addDepartment() {
    connection.query("SELECT * FROM departments", (err, res) => {
        if (err) throw err;

        // displays a list of the departments for reference so that user knows what departments are already included in the database
        for (i = 0; i < res.length; i++) {
            console.table(`${res[i].department_name}`);
        };

        // prompts the user to add a department
        inquirer.prompt({
            type: "input",
            name: "department",
            message: "Add a new department:"
        }).then(function(data) {
            // Inserts and sets the data into the departments table in the database
            connection.query(
                "INSERT INTO departments SET ?", {
                    department_name: data.department
                },
                console.log(chalk.yellow(`Added ${data.department} Department to the database!`)),
                function(err, res) {
                    if (err) throw err;
                    return res;
                });
            begin();
        });
    });
};

// allows user to add a role to the database
function addRole() {
    connection.query("SELECT * FROM roles", (err, res) => {
        if (err) throw err;

        // displays a of list the roles as a reference for the user on what roles are already included in the database
        for (i = 0; i < res.length; i++) {
            console.table(`${res[i].title}`);
        };

        // prompts user the role and salary 
        inquirer.prompt([{
            type: "input",
            name: "role",
            message: "Add a new role:"
        }, {
            type: "number",
            name: "salary",
            message: "Enter the salary of this role:"
        }]).then(function(data) {
            // storing the user's inputs into variables that will be passed into the roleDepartment function
            let newRole = data.role;
            let newSalary = data.salary;
            // calls this function and passing in the variables newRole and newSalary
            roleDepartment(newRole, newSalary);
        });
    });
};

// function that specifically asks the user what department the role should be in
function roleDepartment(role, salary) {
    // query to pull information from the departments table
    connection.query("SELECT * FROM departments", [role, salary], (err, res) => {
        if (err) throw err;

        // prompts and lists down the departments
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
            // the user's selected input will be stored as the department_id in the database where the roles table holds this information
            let deptId;
            for (let i = 0; i < res.length; i++) {
                if (res[i].department_name === data.department) {
                    deptId = res[i].id;
                };
            };
            // inserts and sets the data into the roles table in the database
            connection.query(
                "INSERT INTO roles SET ?", {
                    title: role,
                    salary: salary,
                    department_id: deptId
                },
                console.log(chalk.yellow(`Added new role ${role} to the database!`)),
                function(err, res) {
                    if (err) throw err;
                    return res;
                });
            begin();
        });
    });
};

// function that updates the role of the employees
function updateRole() {
    connection.query("SELECT first_name AS First, last_name AS Last, title AS Title, role_id AS Role_ID FROM employees LEFT JOIN roles ON employees.role_id = roles.id", function(err, res) {
        if (err) throw err;
        console.table(res);

        // prompts the user a list to select an employee to and select the role while being displayed the table as a reference guide
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
            // the employee information set into a variable and splitting the first and last name
            let name = data.employee.split(" ");

            // setting the variables from the name variable holding an array of the first and last name
            let employeefirstName = name[0];
            let employeelastName = name[1];

            // variable to grab the role id
            let updateroleId;
            for (let i = 0; i < res.length; i++) {
                if (res[i].Title === data.updaterole) {
                    updateroleId = res[i].Role_ID;
                };
            };

            // query that updates the employees table and sets the role id by the first and last name 
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

// function to remove an employee from the database
function removeEmployee() {
    connection.query(`
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

            // prompts user which employee they'd like to remove while being displayed a table as a reference guide
            inquirer.prompt({
                type: "list",
                name: "employee",
                message: "Select an employee to remove:",
                choices: function() {
                    let employeeArray = [];
                    for (let i = 0; i < res.length; i++) {
                        employeeArray.push(`${res[i].First} ${res[i].Last}`);
                    };
                    return employeeArray;
                },
            }).then((data) => {
                let name = data.employee.split(" ");

                let removefirstName = name[0];
                let removelastName = name[1];

                // query that removes the employee from the database by the first and last name
                connection.query("DELETE FROM employees WHERE ? AND ?", [{
                        first_name: removefirstName,

                    }, {
                        last_name: removelastName
                    }],
                    console.log(chalk.yellow(`Employee ${removefirstName} ${removelastName} has been removed`)),
                    (err, res) => {
                        if (err) throw err;
                        return res;
                    });
                begin();
            });
        });
};

// function to remove a department from the database
function removeDepartment() {
    connection.query("SELECT id as ID, department_name AS Department FROM departments", (err, res) => {
        if (err) throw err;
        console.table(res);

        // prompts to select a department to remove while being displayed a table as a reference guide
        inquirer.prompt({
            type: "list",
            name: "department",
            message: "Select a department you would like to remove:",
            choices: function() {
                let delDeptArray = [];
                for (let i = 0; i < res.length; i++) {
                    delDeptArray.push(res[i].Department);
                };
                return delDeptArray;
            },
        }).then(function(data) {

            // deletes the department from the database
            connection.query(
                "DELETE FROM departments WHERE ?", {
                    department_name: data.department
                },
                console.log(chalk.yellow(`Removed ${data.department} Department from the database`)),
                function(err, res) {
                    if (err) throw err;
                    return res;
                });
            begin();
        });
    });
};

// function to remove a role from the database
function removeRole() {
    connection.query("SELECT id as ID, title AS Title FROM roles", (err, res) => {
        if (err) throw err;
        console.table(res);

        // prompts user to select the role to remove from the database while being displayed a table as a reference guide
        inquirer.prompt({
            type: "list",
            name: "deleterole",
            message: "Select a role you would like to remove:",
            choices: function() {
                let delRoleArray = [];
                for (let i = 0; i < res.length; i++) {
                    delRoleArray.push(res[i].Title);
                };
                return delRoleArray;
            },
        }).then(function(data) {

            // deletes the role from the database
            connection.query(
                "DELETE FROM roles WHERE ?", {
                    title: data.deleterole
                },
                console.log(chalk.yellow(`Removed the role ${data.deleterole} from the database`)),
                function(err, res) {
                    if (err) throw err;
                    return res;
                });
            begin();
        });
    });
};