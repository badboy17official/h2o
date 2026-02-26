-- Seed Questions for MCQ Competition
-- 12 C + 12 Python + 13 Java + 13 SQL = 50 total questions
-- All questions are BASIC difficulty level

-- C Programming Questions (12)
INSERT INTO questions (category, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('C', 'What is the correct syntax to output "Hello World" in C?', 'printf("Hello World");', 'echo("Hello World");', 'console.log("Hello World");', 'print("Hello World");', 'A', 'basic'),
('C', 'Which data type is used to create a variable that should store text in C?', 'string', 'char[]', 'text', 'String', 'B', 'basic'),
('C', 'What is the size of int data type in C (on most systems)?', '2 bytes', '4 bytes', '8 bytes', '1 byte', 'B', 'basic'),
('C', 'Which operator is used to access the value at the address stored in a pointer?', '&', '*', '->', '.', 'B', 'basic'),
('C', 'What is the correct way to declare a constant in C?', 'const int x = 5;', 'constant int x = 5;', 'final int x = 5;', 'static int x = 5;', 'A', 'basic'),
('C', 'Which loop is guaranteed to execute at least once?', 'for loop', 'while loop', 'do-while loop', 'foreach loop', 'C', 'basic'),
('C', 'What is the output of: printf("%d", 5 + 3 * 2);', '16', '11', '13', '10', 'B', 'basic'),
('C', 'Which header file is required to use printf() function?', '<stdio.h>', '<stdlib.h>', '<string.h>', '<conio.h>', 'A', 'basic'),
('C', 'What does the "break" statement do in a loop?', 'Skips current iteration', 'Exits the loop', 'Restarts the loop', 'Pauses the loop', 'B', 'basic'),
('C', 'Which operator is used to get the address of a variable?', '*', '&', '->', '%', 'B', 'basic'),
('C', 'What is the return type of main() function?', 'void', 'int', 'char', 'float', 'B', 'basic'),
('C', 'Which of the following is NOT a valid C variable name?', 'myVar', '_myVar', '2myVar', 'my_var', 'C', 'basic');

-- Python Programming Questions (12)
INSERT INTO questions (category, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('Python', 'What is the correct file extension for Python files?', '.pyth', '.pt', '.py', '.pyt', 'C', 'basic'),
('Python', 'Which keyword is used to create a function in Python?', 'function', 'def', 'func', 'define', 'B', 'basic'),
('Python', 'What is the output of: print(2 ** 3)', '6', '8', '9', '5', 'B', 'basic'),
('Python', 'Which of the following is used to define a block of code in Python?', 'Curly braces {}', 'Parentheses ()', 'Indentation', 'Square brackets []', 'C', 'basic'),
('Python', 'What is the correct way to create a list in Python?', 'list = (1, 2, 3)', 'list = [1, 2, 3]', 'list = {1, 2, 3}', 'list = <1, 2, 3>', 'B', 'basic'),
('Python', 'Which operator is used for string concatenation in Python?', '+', '&', '.', '*', 'A', 'basic'),
('Python', 'What is the output of: len([1, 2, 3, 4])', '3', '4', '5', '2', 'B', 'basic'),
('Python', 'Which keyword is used to handle exceptions in Python?', 'catch', 'try', 'exception', 'error', 'B', 'basic'),
('Python', 'What is the correct syntax to output "Hello" in Python?', 'echo("Hello")', 'printf("Hello")', 'print("Hello")', 'console.log("Hello")', 'C', 'basic'),
('Python', 'Which method is used to add an item to the end of a list?', 'add()', 'append()', 'insert()', 'push()', 'B', 'basic'),
('Python', 'What is the output of: type(5)', '<class ''int''>', '<class ''float''>', '<class ''number''>', '<class ''integer''>', 'A', 'basic'),
('Python', 'Which symbol is used for single-line comments in Python?', '//', '#', '/*', '--', 'B', 'basic');

-- Java Programming Questions (13)
INSERT INTO questions (category, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('Java', 'What is the correct way to create an object called "myObj" of MyClass?', 'MyClass myObj = MyClass();', 'MyClass myObj = new MyClass();', 'new MyClass myObj;', 'create MyClass myObj;', 'B', 'basic'),
('Java', 'Which keyword is used to inherit a class in Java?', 'inherits', 'extends', 'implements', 'super', 'B', 'basic'),
('Java', 'What is the size of int data type in Java?', '2 bytes', '4 bytes', '8 bytes', '1 byte', 'B', 'basic'),
('Java', 'Which method is the entry point of a Java program?', 'start()', 'main()', 'run()', 'init()', 'B', 'basic'),
('Java', 'What is the correct syntax to output "Hello" in Java?', 'print("Hello");', 'System.out.println("Hello");', 'Console.WriteLine("Hello");', 'echo("Hello");', 'B', 'basic'),
('Java', 'Which keyword is used to create a constant in Java?', 'const', 'constant', 'final', 'static', 'C', 'basic'),
('Java', 'What is the default value of a boolean variable in Java?', 'true', 'false', '0', 'null', 'B', 'basic'),
('Java', 'Which operator is used to compare two values in Java?', '=', '==', '===', 'equals', 'B', 'basic'),
('Java', 'What does JVM stand for?', 'Java Virtual Machine', 'Java Visual Machine', 'Java Variable Method', 'Java Verified Machine', 'A', 'basic'),
('Java', 'Which keyword is used to prevent method overriding?', 'static', 'private', 'final', 'protected', 'C', 'basic'),
('Java', 'What is the correct file extension for Java files?', '.js', '.java', '.class', '.jav', 'B', 'basic'),
('Java', 'Which package is imported by default in Java?', 'java.util', 'java.io', 'java.lang', 'java.awt', 'C', 'basic'),
('Java', 'What is the output of: System.out.println(10 / 3);', '3.33', '3', '3.0', '4', 'B', 'basic');

-- SQL Questions (13)
INSERT INTO questions (category, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('SQL', 'Which SQL statement is used to extract data from a database?', 'GET', 'EXTRACT', 'SELECT', 'OPEN', 'C', 'basic'),
('SQL', 'Which SQL statement is used to update data in a database?', 'MODIFY', 'UPDATE', 'SAVE', 'CHANGE', 'B', 'basic'),
('SQL', 'Which SQL statement is used to delete data from a database?', 'REMOVE', 'DELETE', 'DROP', 'COLLAPSE', 'B', 'basic'),
('SQL', 'Which SQL statement is used to insert new data in a database?', 'ADD', 'INSERT INTO', 'PUT', 'CREATE', 'B', 'basic'),
('SQL', 'Which SQL keyword is used to sort the result-set?', 'SORT', 'ORDER BY', 'SORT BY', 'ARRANGE', 'B', 'basic'),
('SQL', 'Which SQL clause is used to filter records?', 'FILTER', 'WHERE', 'HAVING', 'SELECT', 'B', 'basic'),
('SQL', 'Which SQL keyword is used to return only different values?', 'UNIQUE', 'DIFFERENT', 'DISTINCT', 'DIVERSE', 'C', 'basic'),
('SQL', 'What does SQL stand for?', 'Strong Question Language', 'Structured Query Language', 'Simple Query Language', 'Structured Question Language', 'B', 'basic'),
('SQL', 'Which SQL statement is used to create a table?', 'CREATE TABLE', 'MAKE TABLE', 'BUILD TABLE', 'NEW TABLE', 'A', 'basic'),
('SQL', 'Which SQL function is used to count the number of rows?', 'COUNT()', 'SUM()', 'NUMBER()', 'TOTAL()', 'A', 'basic'),
('SQL', 'Which SQL keyword is used to retrieve a maximum value?', 'TOP', 'MAX', 'MAXIMUM', 'HIGHEST', 'B', 'basic'),
('SQL', 'Which join returns all records when there is a match in either left or right table?', 'INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'RIGHT JOIN', 'C', 'basic'),
('SQL', 'Which SQL statement is used to create a database?', 'CREATE DATABASE', 'MAKE DATABASE', 'NEW DATABASE', 'BUILD DATABASE', 'A', 'basic');
