/*第三章*/
/*二*/
/*1. */
create database schooldb;
/*2.*/
Use schooldb;
CREATE TABLE class  (
  班级编号 char(6) NOT NULL PRIMARY KEY,
  班级名称 varchar(20) NOT NULL,
  院系 varchar(30)  NOT NULL,
  年级 int NULL ,
  人数 int NULL
) ;
CREATE TABLE course  (
  课程号 char(6) NOT NULL PRIMARY KEY,
  课程名 varchar(20) NOT NULL,
  学分 int NOT NULL,
  学时 int NOT NULL,
  学期 char(2)  NULL ,
  前置课 char(6) NULL 
 );
CREATE TABLE score  (
  学号 char(10)  NOT NULL,
  课程号 char(6)  NOT NULL,
  成绩 float(5,2) NULL,
  PRIMARY KEY (学号, 课程号) 
);
CREATE TABLE student  (
  学号 char(10) NOT NULL PRIMARY KEY ,
  姓名 varchar(20) NOT NULL,
  性别 char(2)  NOT NULL,
  出生日期 date NULL,
  地区 varchar(20) NULL ,
  民族 varchar(10)  NULL DEFAULT '汉',
  班级编号 char(6)  NULL 
);
/*3.*/
/*(1)*/
ALTER TABLE student 
ADD FOREIGN KEY (班级编号) REFERENCES class (班级编号);
/*(2)*/
 ALTER TABLE course
ADD FOREIGN KEY (前置课) REFERENCES course (课程号) 
ON DELETE SET NULL ON UPDATE CASCADE;
/*(3)*/
 ALTER TABLE score 
ADD FOREIGN KEY (学号) REFERENCES student (学号) 
ON DELETE RESTRICT ON UPDATE RESTRICT;
/*(4)*/
 ALTER TABLE score 
ADD  FOREIGN KEY (课程号) REFERENCES course (课程号) 
ON DELETE CASCADE ON UPDATE CASCADE;
/*4.*/
 alter table score
add check(成绩>=0 and 成绩<=100);
/*5.*/
 alter table student 
 add check(性别='男' or 性别='女');
/*第四章：*/

/*二、*/
/*1. */
-- ----------------------------
-- Records of class
-- ----------------------------
INSERT INTO `class` VALUES ('AC1301', '会计23-1班', '会计学院', 2023, 35);
INSERT INTO `class` VALUES ('AC1302', '会计23-2班', '会计学院', 2023, 35);
INSERT INTO `class` VALUES ('CS1401', '计算机24-1班', '计算机学院', 2024, 35);
INSERT INTO `class` VALUES ('IS1301', '信息系统23-1班', '信息学院', 2023, NULL);
INSERT INTO `class` VALUES ('IS1401', '信息系统24-1班', '信息学院', NULL, 30);
-- ----------------------------

-- ----------------------------
-- Records of score
-- ----------------------------
INSERT INTO `score` VALUES ('2013110101', '11003', 90.00);
INSERT INTO `score` VALUES ('2013110101', '21001', 86.00);
INSERT INTO `score` VALUES ('2013110103', '11003', 89.00);
INSERT INTO `score` VALUES ('2013110103', '21001', 86.00);
INSERT INTO `score` VALUES ('2013110201', '11003', 78.00);
INSERT INTO `score` VALUES ('2013110201', '21001', 92.00);
INSERT INTO `score` VALUES ('2013110202', '11003', 82.00);
INSERT INTO `score` VALUES ('2013110202', '21001', 85.00);
INSERT INTO `score` VALUES ('2013310101', '21004', 83.00);
INSERT INTO `score` VALUES ('2013310101', '31002', 68.00);
INSERT INTO `score` VALUES ('2013310103', '21004', 80.00);
INSERT INTO `score` VALUES ('2013310103', '31002', 76.00);
INSERT INTO `score` VALUES ('2014210101', '21002', 93.00);
INSERT INTO `score` VALUES ('2014210101', '21004', 89.00);
INSERT INTO `score` VALUES ('2014210102', '21002', 95.00);
INSERT INTO `score` VALUES ('2014210102', '21004', 88.00);
INSERT INTO `score` VALUES ('2014310101', '21001', 79.00);
INSERT INTO `score` VALUES ('2014310101', '21004', 80.00);
INSERT INTO `score` VALUES ('2014310102', '21001', 91.00);
INSERT INTO `score` VALUES ('2014310102', '21004', 87.00);
-- ----------------------------
-- Records of student
-- ----------------------------
INSERT INTO `student` VALUES ('2013110101', '张晓勇', '男', '2005-12-11', '山西', '汉', 'AC1301');
INSERT INTO `student` VALUES ('2013110103', '王一敏', '女', '2005-00-00', '河北', '汉', 'AC1301');
INSERT INTO `student` VALUES ('2013110201', '江山', '女', '2005-09-17', '内蒙古', '锡伯', 'AC1302');
INSERT INTO `student` VALUES ('2013110202', '李明', '男', '2005-01-14', '广西', '壮', 'AC1302');
INSERT INTO `student` VALUES ('2013310101', '黄菊', '女', '2004-09-30', '北京', '汉', 'IS1301');
INSERT INTO `student` VALUES ('2013310103', '吴昊', '男', '2005-11-18', '河北', '汉', 'IS1301');
INSERT INTO `student` VALUES ('2014210101', '刘涛', '男', '2006-04-03', '湖南', '侗', 'CS1401');
INSERT INTO `student` VALUES ('2014210102', '郭志坚', '男', '2006-02-21', '上海', '汉', 'CS1401');
INSERT INTO `student` VALUES ('2014310101', '王林', '男', '2006-10-09', '河南', '汉', 'IS1401');

/*2.*/
/*(1).*/
 insert into student values('502001', '王晓林', '男', '2006-02-10', '广东' , '汉','IS2020');
/*(2).*/
 insert into student set 学号='500102',姓名='林丽',性别='女';
/*(3)*/
 update student set 地区=concat(地区,'（省或市）');
/*(4）*/
update student set 出生日期='2005-02-10',班级编号='AC1302' where  姓名='王一敏';
/*(5) */
delete from student where 出生日期<'2005-01-01';
/*第五章*/
/*二、*/
/*1.*/
/*（1）*/
select 姓名 as name,(year(now())-year(出生日期)) as age from student;
/*（2）*/
select *,
    case 
     when 成绩>=90 then '优'
    when 成绩>=75 and 成绩<90 then '良'
    when 成绩>=60 and 成绩<75 then '及格'
    else '不及格'
    end as 成绩档 from score;
/*（3）*/
select 课程名,学分 from course where 学时>=48;
/*（4）*/
select 课程名,学期 from course where 前置课 is null;
/*（5）*/
select * from student where 姓名 like '王__';
/*2.*/
/*（1）*/
select student.学号,姓名,score.课程号,成绩 from student,course,score where student.学号=score.学号 and course.课程号=score.课程号;
/*（2）*/
select 学号,姓名,班级名称 from student,class where student.班级编号=class.班级编号 and 院系 ='会计学院';
/*（3）*/
select score.学号,姓名,成绩 from student,score where student.学号=score.学号 and  成绩>90;
/*（4）*/
select course.课程号,课程名,学号,成绩 from course left join score on course.课程号=score.课程号;
/*（5）*/
select 学号,姓名 from student where 班级编号 in (select 班级编号 from class where 班级名称='计算机24-1班');

/*3.*/
/*（1）*/
select 性别,count(*) from student group by 性别;
/*（2）*/
select 学号,count(课程号),avg(成绩),max(成绩) from score group by 学号;
/*（3）*/
select 学号,count(课程号),avg(成绩),max(成绩) from score group by 学号 having avg(成绩)>=80;
/*（4）*/
select 性别,民族,count(*) from student group by 性别,民族 order by count(*) ;

/*第六章*/

/*二、*/
/*1.*/
create view v_score as
    select student.学号,姓名,民族,课程号,成绩
    from student,score
where student.学号=score.学号;
/*2.*/
select 学号,姓名,课程号,成绩
    from v_score
where 民族!='汉';
/*3.*/
create view v_avg(num,score_avg) as
select 学号,avg(成绩) from score group by 学号;
/*4.*/
select * from v_avg where score_avg>80;
/*5.*/
create view v_student as 
select * from student where 民族='汉' with check option;
insert into v_student values('2020410001','李牧','男','2008-10-21','广东','汉',NULL);
/*6.*/
delete from v_student where 性别='女';
/*第七章*/

/*二、*/
/*1. */
create index I_kc 
       on course(课程名(3) ASC);
/*2.*/
 alter table class
add index I_cx(院系,年级);
/*3. */
alter table student
     add unique (姓名);
/*4.*/
 alter table class
add primary key (课程号);
/*5.*/
 alter table score
    add primary key(学号,课程号),
add index (成绩);
/*6.*/
alter table course drop primary key ;
/*7.*/
 alter table course
    partition by Key(学分) partitions  4;
/*第8章习题*/

/*二、*/
/*1. */
Set @x=12.54;Set @y=-10.63456;
/*（1）*/
Select floor(@x),floor(@y),round(@x),round(@y);
/*(2)*/
 SELECT TRUNCATE(@y, 2),TRUNCATE(@y, 4);

/*2.*/

 SET @s1='ABCDEFG';SET@s2=' XYZ ';
 /* (1)*/
SELECT LEFT(@s1, 3) ,right(@s1,3);
/*(2) */
SELECT LTRIM(@s2),RTRIM(@s2),TRIM(@s2);
/*(3)*/
   select substring(@s1,3,4);
/*(4)*/
    SELECT STRCMP(@s1, @s2);
/*3.*/
 select now(),CURTIME(),CURDATE(),YEAR(now()),MONTHNAME(now()),
           DAYNAME(now()),DATE_ADD(now(), INTERVAL -10 DAY);
/*4.*/

/*(1)*/
 DELIMITER $$
    CREATE PROCEDURE show_jj
            ( OUT season VARCHAR(8) )
    BEGIN
        CASE 
            WHEN month(now()) in (1,2,3) THEN SET season ='春季';
            WHEN month(now()) in (4,5,6) THEN SET season ='夏季';
            WHEN month(now()) in (7,8,9) THEN SET season ='秋季';
            WHEN month(now()) in (10,11,12) THEN SET season ='冬季';
        END CASE;
    END$$
DELIMITER ;
call show_jj(@a);
select @a;
/*（2）*/

DELIMITER $$
create procedure sum_n(in n int,out rs int)
begin
Set rs=0;
WHILE  n > 0  DO
   Set rs=rs+n;
  SET n = n-1;
   END WHILE;
End $$
DELIMITER ;
call sum_n(10,@a);
select @a;
call sum_n(100,@a);
select @a;
/*(3)*/
 delimiter $$
create procedure kc_xg(in xq int)
    begin
    declare kch char(6);
    declare xs int;
    declare state char(10) default 'ok';
    declare xg_c cursor for select 课程号,学时 from course where 学期=xq;
    declare continue handler for 1329 set state='error';
    open xg_c;
    repeat
      fetch xg_c into kch,xs;
 set xs=xs+5;
      if(xs>65) then set xs=65;
      end if;
      If state='ok' then  update course set 学时=xs where 课程号=kch;
      end if;
    until state='error'
    end repeat;
    close xg_c;
    end $$
delimiter;  
call kc_xg(2);
/*5.*/

Create function F_kc( kch char(6))
Returns char(20)
DETERMINISTIC
Return (select 课程名 from course where 课程号=kch);
select F_kc('11003');
/*6.*/
/*（1）*/
DELIMITER $$
CREATE TRIGGER c_dl AFTER DELETE
    ON course FOR EACH ROW
BEGIN
   DELETE from score  WHERE 课程号=OLD.课程号;
END$$
DELIMITER ;

/*（2）*/
DELIMITER $$
CREATE TRIGGER s_ins AFTER INSERT
    ON student FOR EACH ROW
BEGIN
   
        UPDATE class  set 班级人数=班级人数+1  WHERE 编辑编号=NEW.班级编号;
   
END$$
DELIMITER ;
/*（3）*/
DELIMITER $$
CREATE TRIGGER s_up AFTER UPDATE
    ON student FOR EACH ROW
BEGIN
If new.民族!='汉' then
   
        UPDATE score  set 成绩=成绩+1  WHERE 学号=NEW.学号;
 End if;  
END$$
DELIMITER ;
/*7*/
/*（1）*/
CREATE EVENT event_up ON SCHEDULE EVERY 1 MINUTE
STARTS CURDATE() + INTERVAL 1 MINUTE
DO
UPDATE  course set 学分=学分+1 where 课程号= '11003';
/*（2）*/
Select @@EVENT_SCHEDULER;
SET GLOBAL EVENT_SCHEDULER=1;
/*(3)*/
DROP EVENT event_up;

/*第九章*/

/*二、*/
/*1.*/
/*(1)*/
CREATE USER
    king1@localhost IDENTIFIED BY 'ken1', 
king2@localhost IDENTIFIED BY 'ken2';
/*(2)*/
 GRANT SELECT
    ON  schooldb.student 
        TO king1@localhost;
/*(3)*/
 GRANT SELECT,update
    ON  schooldb.class 
        TO king2@localhost;
/*(4)*/
 GRANT SELECT
    ON  schooldb.* 
        TO king1@localhost;
/*(5)*/
 GRANT ALL
    ON  schooldb.* 
        TO king1@localhost;
/*(6)*/
 REVOKE  DELETE
    ON  schooldb.class
        FROM  king2@localhost;
/*2.*/
 SELECT * FROM course INTO OUTFILE 'D:/c1.txt'
    FIELDS  TERMINATED BY ','	OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '?';
LOAD DATA INFILE  'D:/c1.txt'	INTO TABLE backup_c FIELDS  TERMINATED BY ','  OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '?';
