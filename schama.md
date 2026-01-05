CREATE DATABASE IF NOT EXISTS book_store;
USE book_store;

CREATE TABLE books (
  isbn CHAR(10) PRIMARY KEY,
  author VARCHAR(100),
  title VARCHAR(200),
  price FLOAT,
  subject VARCHAR(100)
);

CREATE TABLE members (
  userid INT AUTO_INCREMENT PRIMARY KEY,
  fname VARCHAR(50),
  lname VARCHAR(50),
  address VARCHAR(50),
  city VARCHAR(30),
  zip INT,
  phone VARCHAR(15),
  email VARCHAR(40) UNIQUE,
  password VARCHAR(200)
);

CREATE TABLE orders (
  ono INT AUTO_INCREMENT PRIMARY KEY,
  userid INT,
  created DATE,
  shipAddress VARCHAR(50),
  shipCity VARCHAR(30),
  shipZip INT,
  FOREIGN KEY (userid) REFERENCES members(userid)
);

CREATE TABLE order_details (
  odid INT AUTO_INCREMENT PRIMARY KEY,
  ono INT,
  isbn CHAR(10),
  qty INT,
  amount FLOAT,
  FOREIGN KEY (ono) REFERENCES orders(ono),
  FOREIGN KEY (isbn) REFERENCES books(isbn)
);

CREATE TABLE cart (
  userid INT,
  isbn CHAR(10),
  qty INT,
  PRIMARY KEY (userid, isbn),
  FOREIGN KEY (userid) REFERENCES members(userid),
  FOREIGN KEY (isbn) REFERENCES books(isbn)
);
