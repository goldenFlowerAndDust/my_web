-- 完整型约束

/*			一、新建表时添加约束
									1. 添加字段级约束：在字段名和类型
									2.主键 (primary key)  ,不重复不为null，一个表只有一个
									3.check(条件) 检查约束
									4.unique 替代主建，不重复可为null，一个表可多个
									5.default 默认值
				二、表级约束：
									1.在字段最下面[CONSTRAINT 约束名] 约束类型(字段名)
				三、外键约束：
									1.外表/主表 ，子表、默认restrict拒绝修改
									2.cascade 自动更新
									
*/

create table student(
sno char(7) primary key,
sname varchar(10) not NULL,
sex char(1) check(sex='男' or sex = '女'),
seat int unique,
	age int default 18
);

create table student1(
sno char(7),
sname varchar(10) not NULL,
sex char(1),
seat int unique,
age int default 18,
PRIMARY key(sno),
check(sex='男' or sex='女')
);

create table student2(
sno char(7),
sname varchar(10) not NULL,
sex char(1),
seat int unique,
age int default 18,
PRIMARY key(sno),
check(sex='男' or sex='女'),
FOREIGN key(sno) REFERENCES student(sno)
);

create table student3(
sno char(7),
sname varchar(10) not NULL,
sex char(1),
seat int unique,
age int default 18,
PRIMARY key(sno),
check(sex='男' or sex='女'),
FOREIGN key(sno) REFERENCES student1(sno) on delete CASCADE on UPDATE CASCADE
);




