/*实训3代码*/
/*1．使用命令行方式完成以下操作*/
/*(1)*/
create database LibraryDB;
create database MyTest;
/*(2)*/
use librarydb;
/*(3)*/
 CREATE TABLE 读者表  (
  读者编号 char(6) NOT NULL  PRIMARY KEY,
  姓名 char(10) NOT NULL,
  类别号 char(2) NOT NULL,
  单位 varchar(20) NULL,
  有效性 char(10) NULL
 );
CREATE TABLE 读者类型表  (
  类别号 char(2) NOT NULL PRIMARY KEY ,
  类名 char(10) NOT NULL,
  可借数量 int NULL,
  可借天数 int NULL
 );
 CREATE TABLE 库存表  (
  条码 char(20) NOT NULL  PRIMARY KEY,
  书号 char(10) NOT NULL,
  位置 varchar(20) NOT NULL,
  库存状态 char(10) NULL 
);
 CREATE TABLE 借阅表  (
  借阅号 int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  条码 char(20) NOT NULL,
  读者编号 char(6) NOT NULL,
  借阅日期 date NULL,
  还书日期 date NULL,
  借阅状态 char(6) NULL  
);
CREATE TABLE 图书表  (
  书号 char(10) NOT NULL  PRIMARY KEY , 
  书名 varchar(20) NOT NULL,
  类别 char(10) NOT NULL,
  作者 varchar(20) NOT NULL,
  出版社 varchar(20) NOT NULL,
  单价 float(5, 2) NULL,
  数量 int NULL
);
/*(4)*/
 show databases;
/*(5)*/
use librarydb;
show tables;
/*(6)*/
drop database MyTest;
/*3．建立数据完整性约束*/
/*(1)*/
ALTER TABLE 读者表 
ADD PRIMARY KEY (读者编号);
/*(2)*/
ALTER TABLE 读者表 
ADD FOREIGN KEY (类别号) REFERENCES 读者类型表 (类别号) 
ON DELETE CASCADE 
ON UPDATE CASCADE;
/*(3)*/
 ALTER TABLE 借阅表 
ADD FOREIGN KEY (读者编号) REFERENCES 读者表 (读者编号) 
ON DELETE RESTRICT 
ON UPDATE RESTRICT;
/*(4)*/
ALTER TABLE 借阅表 
ADD FOREIGN KEY (条码) REFERENCES 库存表 (条码) 
ON DELETE CASCADE 
ON UPDATE CASCADE;
/*(5)*/
alter table 读者类型表
   add check(可借数量>=0 and 可借数量<=30);
/*(6)*/
alter table 库存表
    add check(库存状态 in ( '在馆','借出','丢失'));
/*实训4*/
/*1*/
-- ----------------------------
-- Records of 借阅表
-- ----------------------------
INSERT INTO `借阅表` VALUES (100001, '123413', '0001', '2020-11-05', NULL, '借阅');
INSERT INTO `借阅表` VALUES (100002, '223411', '0002', '2020-09-28', '2020-10-13', '已还');
INSERT INTO `借阅表` VALUES (100003, '321123', '1001', '2020-07-01', NULL, '过期');
INSERT INTO `借阅表` VALUES (100004, '321124', '2001', '2020-10-09', '2020-10-14', '已还');
INSERT INTO `借阅表` VALUES (100005, '321124', '0001', '2020-10-15', NULL, '借阅');
INSERT INTO `借阅表` VALUES (100006, '223411', '2001', '2020-10-16', NULL, '借阅');
INSERT INTO `借阅表` VALUES (100007, '411111', '1002', '2020-09-01', '2020-09-24', '已还');
INSERT INTO `借阅表` VALUES (100008, '411111', '0001', '2020-09-25', NULL, '借阅');
INSERT INTO `借阅表` VALUES (100009, '411111', '1001', '2020-10-08', NULL, '借阅');
-- ----------------------------
-- Records of 图书表
-- ----------------------------
INSERT INTO `图书表` VALUES ('A0120', '庄子', '文学', '庄周', '吉林大学出版社', 18.50, 5);
INSERT INTO `图书表` VALUES ('A0134', '唐诗三百首', '文学', '李平', '安徽科学出版社', 28.00, 10);
INSERT INTO `图书表` VALUES ('B1101', '西方经济学史', '财经', '莫竹芩', '海南出版社', 39.80, 8);
INSERT INTO `图书表` VALUES ('B2213', '商业博弈', '财经', '孔英', '北京大学出版社', 39.00, 15);
INSERT INTO `图书表` VALUES ('C1269', '数据结构', '计算机', '李刚', '高等教育出版社', 29.00, 20);
INSERT INTO `图书表` VALUES ('C3121', '品牌策划与推广', '计算机', '张晓红', '人民邮电出版社', 42.00, 6);
INSERT INTO `图书表` VALUES ('C3182', 'C语言程序设计', '计算机', '李学刚', '高等教育出版社', 36.80, 11);
INSERT INTO `图书表` VALUES ('C3256', 'MySQL数据库', '计算机', '孙季红', '电子工业出版社', 29.00, 9);
-- ----------------------------
-- Records of 库存表
-- ----------------------------
INSERT INTO `库存表` VALUES ('123412', 'A0120', '1-A-56', '在馆');
INSERT INTO `库存表` VALUES ('123413', 'A0120', '1-A-57', '借出');
INSERT INTO `库存表` VALUES ('223410', 'A0134', '2-B-01', '在馆');
INSERT INTO `库存表` VALUES ('223411', 'A0134', '2-B-02', '借出');
INSERT INTO `库存表` VALUES ('311231', 'B1101', '2-C-23', '在馆');
INSERT INTO `库存表` VALUES ('321123', 'C1269', '3-A-12', '丢失');
INSERT INTO `库存表` VALUES ('321124', 'C1269', '3-A-13', '借出');
INSERT INTO `库存表` VALUES ('411111', 'C3256', '3-B-01', '借出');
INSERT INTO `库存表` VALUES ('411112', 'C3256', '3-B-02', '借出');
INSERT INTO `库存表` VALUES ('411113', 'C3256', '3-B-03', '在馆');
-- ----------------------------
-- Records of 读者类型表
-- ----------------------------
INSERT INTO `读者类型表` VALUES ('1', '学生', 10, 30);
INSERT INTO `读者类型表` VALUES ('2', '教师', 20, 60);
INSERT INTO `读者类型表` VALUES ('3', '职工', 15, 20);
-- ----------------------------
-- Records of 读者表
-- ----------------------------
INSERT INTO `读者表` VALUES ('0001', '张小东', '1', '软件学院', '有效');
INSERT INTO `读者表` VALUES ('0002', '苏明', '1', '财经学院', '有效');
INSERT INTO `读者表` VALUES ('1001', '梁小红', '2', '软件学院', '有效');
INSERT INTO `读者表` VALUES ('1002', '赵明敏', '2', '传媒学院', '有效');
INSERT INTO `读者表` VALUES ('2001', '李丰年', '3', '计财处', '有效');

/*2*/
/*(1)*/
insert into 借阅表 
set 条码='223410',
借阅日期=curdate(),
读者编号='2001',
借阅状态='借阅';
update 库存表 set 库存状态='借出' where 条码='223410';
/*(2)*/
insert into 图书表 
value('C3325','计算机基础','计算机','陈焕东','高等教育出版社',38.6,2);
insert into 库存表 
values('331122','C3325','3-B-01','在馆'),
('331132','C3325','3-B-02','在馆');
/*(3)*/
delete from 读者表,借阅表 
Using(读者表,借阅表) 
where 姓名='苏明' and 
读者表.读者编号=借阅表.读者编号;

/*实训5*/
/*1．单表查询*/
/*(1)*/
select distinct 书号,库存状态 from 库存表;
/*(2)*/
select 姓名 as name ,单位 as college from 读者表;
/*(3)*/
select 书名,数量*单价 as 金额 from 图书表;
/*(4)*/
select 条码,库存状态,
    case 
    when 库存状态='在馆' then '1'
    when 库存状态='借出' then '0'
    when 库存状态='丢失' then '-1'
    end as 库存状态1
     from 库存表;

/*2．条件查询*/
/*(1)*/
select 书名,数量,出版社 from 图书表 where 数量>=10;
/*(2)*/
select * from 库存表 where 库存状态='借出' and 位置 like '%A%';
/*(3)*/
select * from 图书表 where (类别='财经' or 类别='文学') and 数量>5;
/*(4)*/

select * from 借阅表 where 还书日期 is null;
/*3．多表查询*/
/*(1)*/
select * from 读者表,借阅表 where 读者表.读者编号=借阅表.读者编号 and 姓名='张小东';
/*(2)*/
select 书号,借阅表.条码 from 库存表,借阅表 where  库存表.条码=借阅表.条码 and 借阅状态='借阅';
/*(3)*/
select 姓名,单位,可借天数,可借数量 from 读者表,读者类型表 where 读者表.类别号=读者类型表.类别号;
/*(4)*/
select 姓名,书名,借阅日期,借阅状态 from 借阅表,读者表,图书表,库存表 where 库存表.书号=图书表.书号 and 借阅表.读者编号=读者表.读者编号 and 库存表.条码=借阅表.条码;
/*(5)*/
select 库存表.条码,位置,读者编号 from 库存表 left join 借阅表 on 库存表.条码=借阅表.条码;

/*4．分类汇总与排序*/
/*(1)*/
 select 单位,count(*) from 读者表 group by 单位;
/*(2)*/
select 单位,count(*) from 读者表 group by 单位 having count(*)>=2;
/*(3)*/
select 出版社,avg(单价) ,sum(数量*单价)from 图书表 group by 出版社 ;
/*(4)*/
select 读者编号,条码,count(*) from 借阅表 group by  读者编号,条码 with rollup ;
/*(5)*/
select * from 图书表 order by 数量 desc;
/*(6)*/
 select * from 借阅表 order by 借阅状态,借阅日期;
/*(7)*/
 select 类别号,单位,count(*) from 读者表,借阅表 where 读者表.读者编号=借阅表.读者编号 group by 类别号 ,单位 order by count(*) desc;
/*实训6*/
/*1*/
/*(1)*/
 create view L_view1 as
    select 读者编号,姓名,类名,可借天数,可借数量
    from 读者表,读者类型表
    where 读者表.类别号=读者类型表.类别号;
/*(2)*/
 select 读者编号,姓名,类名,可借天数,可借数量
    from l_view1
    where 类名='学生';
/*(3)*/
create view L_view2 as
    select 借阅号,书号,姓名,借阅日期,还书日期
    from 读者表,借阅表,库存表
    where 读者表.读者编号=借阅表.读者编号  and 库存表.条码=借阅表.条码;
/*(4)*/
select 借阅号,书号,姓名,借阅日期,还书日期
    from l_view2
    where 还书日期 is null;
/*(5)*/
create view L_view3 as
     select * from 借阅表
    where 借阅状态='借阅' or 借阅状态='已还'
    WITH CHECK OPTION;
/*2*/
/*(1)*/
insert into l_view3 values(100010,'411112','2001','2023-10-18',Null,'借阅');
/*(2)*/
 update l_view2 set 借阅日期=curdate() where 借阅号=100001;
/*(3)*/
delete from l_view3 where 还书日期 is not Null;
/*3*/
 drop view l_view2,l_view3;

/*实训7*/
/*1*/
/*(1)*/
CREATE INDEX I_bm ON 读者表(单位 DESC);
/*(2)*/
CREATE INDEX I_tr ON 借阅表(条码,读者编号);
/*(3)*/
 CREATE UNIQUE INDEX U_wz ON 库存表(位置);
/*2*/
/*(1)*/
alter table 图书表
    add unique index (书名),
    add index(作者,出版社);
/*(2)*/
alter table 读者类型表
    add primary key (类别号);
/*3*/
create table cpk(
产品编号 char(6) not null,
产品名称 char(20) not null,
单价 float(5,2),
库存量 int, 
primary key(产品编号),
index(库存量,单价));
/*4*/
show index from 图书表;
/*5*/
alter table 借阅表
    partition by hash(借阅号) partitions  3;
/*实训8*/
/*1*/
/*（1）*/
 delimiter $$
create procedure tj_b(in c_sh char(20))
    begin
    declare sl int;
    select  count(*)  into sl from 库存表 group by 书号 having 书号=c_sh;
    update 图书表 set 数量=sl where 书号=c_sh;
    end $$
delimiter;  


call tj_b('A0120');


/*（2）*/
delimiter $$
create procedure jy_b(in c_dz char(10),out c_qk varchar(100))
    begin
    declare tm char(20);
    declare rq1,rq2 date;
    declare ts int;
    declare state char(10) default 'ok';
    declare zt_c cursor for select 条码,借阅日期,还书日期 from 借阅表 where 读者编号=c_dz;
    declare continue handler for 1329 set state='error';
    set c_qk='';
    open zt_c;
    repeat
      fetch zt_c into tm,rq1,rq2;
      if(rq2 is NULL) then set ts=TIMESTAMPDIFF(day,rq1,curdate());
      else 
      set ts=TIMESTAMPDIFF(day,rq1,rq2);
      end if;
   If state='ok' then
      begin
      if(ts<=15) then set c_qk= CONCAT_WS('#',c_qk,tm,'正常');
      end if;
     if(ts>15 and ts<=30) then set c_qk=CONCAT_WS('#',c_qk,tm,'通知还书');
      end if;
      if(ts>30) then set c_qk=CONCAT_WS('#',c_qk,tm,'逾期');
      end if;
      end ;
    end if;
    until state='error'
    end repeat;
    close zt_c;
    end $$
delimiter;  

call jy_b('0001',@a);
select @a;
/*2*/
/*（1）*/
CREATE FUNCTION SP_NUM()
    RETURNS float(7,2) 
DETERMINISTIC
RETURN ( SELECT sum(单价*数量) FROM 图书表);

 select sp_num();
/*（2）*/
DELIMITER $$
CREATE FUNCTION SP_dz (xm char(10))
    RETURNS int
DETERMINISTIC
BEGIN
    DECLARE lp char(2);DECLARE ts int;
    SELECT  读者类型表.类别号, 可借天数 INTO  lp,ts 
       FROM 读者类型表,读者表 
       WHERE 读者类型表.类别号=读者表.类别号 and 姓名=xm;
    IF lp='1' THEN RETURN ts;
    ELSE 
        RETURN -1;
    END IF;
END $$ 
DELIMITER ;
/*3*/
/*（1）*/
DELIMITER $$
CREATE TRIGGER dz_dl AFTER DELETE
    ON 读者表 FOR EACH ROW
BEGIN
   
        DELETE from 借阅表  WHERE 读者编号=OLD.读者编号;
   
END$$
DELIMITER ;

/*（2）*/
DELIMITER $$
CREATE TRIGGER jy_ins AFTER INSERT
    ON 借阅表 FOR EACH ROW
BEGIN
   
        UPDATE 库存表  set 库存状态='借出' WHERE 条码=NEW.条码;
   
END$$
DELIMITER ;
/*（3）*/
DELIMITER $$
CREATE TRIGGER jy_up AFTER UPDATE
    ON 借阅表 FOR EACH ROW
BEGIN
   
        UPDATE 库存表  set 库存状态='在馆' WHERE 条码=NEW.条码;
   
END$$
DELIMITER ;
/*4*/
/*（1）*/
CREATE EVENT event_up ON SCHEDULE EVERY 1 MINUTE
STARTS CURDATE() + INTERVAL 1 MINUTE
DO
UPDATE 图书表 set 数量=数量+1 where 书名= 'MySQL数据库';

/*（2）*/
select 数量,now() from 图书表  where 书名= 'MySQL数据库';
/*(3)*/
ALTER EVENT event_up DISABLE;

/*第9章*/
/*1*/
/*(1)*/
CREATE USER
    user1@localhost IDENTIFIED BY '123', 
    user2@localhost IDENTIFIED BY '123',
    user3@localhost IDENTIFIED BY '123';
/*(2)*/
SET PASSWORD FOR user3@localhost= '123456';
/*(3)*/
DROP USER user3@localhost;
/*(4)*/
DROP USER user3@localhost;

/*2*/
/*(1)*/
USE librarydb;
GRANT SELECT
    ON  读者表 
        TO user1@localhost;


/*(2)*/
USE librarydb;
GRANT SELECT,update,delete
    ON  借阅表 
        TO user1@localhost;
/*(3)*/
GRANT ALL
    ON  librarydb.* 
        TO user1@localhost;
/*(4)*/
GRANT SELECT
    ON  Bookstore.sell
    TO  user2@localhost
    WITH GRANT OPTION;
/*(5)*/
 REVOKE  SELECT
    ON  librarydb.读者表
        FROM  user1@localhost;
/*3*/
/*(1)*/
SELECT * FROM 库存表 INTO OUTFILE 'D:/kc.txt'
    FIELDS  TERMINATED BY ','	OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '?';
/*(2)*/
CREATE TABLE c_kc LIKE 库存表 ;
LOAD DATA INFILE  'D:/kc.txt'	INTO TABLE  c_kc
    FIELDS  TERMINATED BY ','  OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '?';