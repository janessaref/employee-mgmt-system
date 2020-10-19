USE employeeMgmt_DB;

INSERT INTO departments (department_name)
VALUES 
    ("Engineering"),
    ("Legal"),
    ("Finance"),
    ("Sales");

INSERT INTO roles (title, salary, department_id)
VALUES 
    ("Sales Lead", 100000, 4),
    ("Salesperson", 80000, 4),
    ("Lead Engineer", 150000, 1),
    ("Software Engineer", 120000, 1),
    ("Accountant", 125000, 3),
    ("Accounts Manager", 200000, 3),
    ("Legal Team Lead", 250000, 2),
    ("Lawyer", 190000, 2);


INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
    ("John", "Smith", 6, NULL),
    ("Jane", "Doe", 5, 1),
    ("John", "Rogers", 7, NULL),
    ("Ashley", "Ray", 8, 3);