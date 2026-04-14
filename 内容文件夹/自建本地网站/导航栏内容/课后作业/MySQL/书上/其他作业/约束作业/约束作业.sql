-- 1.创建数据库
create database testO4_company;

-- 2. 建立数据表

--  第一个数据表：offices
create table if not exists offices(
	officeCode int(10) PRIMARY key not null,
	city VARCHAR(50) not null,
	address VARCHAR(50) null,
	country VARCHAR(50) not null,
	postalCode VARCHAR(15) UNIQUE
);

-- 第二个数据表：employees

create table if not exists employees(
	employeeNumber int(10) primary key not null AUTO_INCREMENT,
	lastName VARCHAR(50) not null,
	firstName VARCHAR(50) not null,
	mobile VARCHAR(25) not null unique,
	officeCode int(10) ,
	CONSTRAINT fk_employees_officeCode_offices FOREIGN key (officeCode) REFERENCES offices (officeCode),
	jobTitle VARCHAR(50) not null ,
	birth DATETIME not null ,
	note VARCHAR(255),
	sex VARCHAR(5)
);