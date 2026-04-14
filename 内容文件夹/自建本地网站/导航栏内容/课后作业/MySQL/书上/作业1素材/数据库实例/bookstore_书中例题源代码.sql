/*第三章例题代码*/
/*【例3-1】*/
CREATE  DATABASE  Bookstore;
/*【例 3-2】*/
CREATE DATABASE Petstore
            DEFAULT CHARACTER SET gb2312 
                COLLATE  gb2312_chinese_ci;

/*【例3-3】*/
ALTER DATABASE Petstore    
        DEFAULT CHARACTER SET utf8mb4
        DEFAULT COLLATE  utf8mb4_0900_ai_ci;

/*【例3-4】*/
USE Bookstore;
CREATE TABLE  book (
    图书编号  char(10)   		NOT NULL  PRIMARY KEY,
    图书类别  varchar(20)  	NOT NULL  DEFAULT  '计算机',
    书名       varchar(40)  	NOT  NULL ,
    作者       char(10)     	NOT  NULL ,
    出版社     varchar(20)  	NOT  NULL ,
    出版时间   date          	NOT  NULL ,
    单价      float(5,2)      	NOT  NULL ,
    数量      int(5),   
    折扣      float(3,2) ,  
    封面图片  blob
) ENGINE=InnoDB;
/*【例3-5】*/
USE Bookstore;
ALTER TABLE book
    ADD 浏览次数 tinyint NULL ,
    DROP COLUMN 书名 ;
/*【例3-6】*/
USE Bookstore;
ALTER TABLE book
    RENAME TO mybook;
/*【例3-7】*/
USE Bookstore;
RENAME TABLE mybook TO booklist, members TO memberlist;
/*【例3-8】*/
CREATE TABLE book_copy1 LIKE book;
/*【例3-9】*/
CREATE TABLE  book_copy2 
    AS
        (SELECT  *  FROM  book);
/*【例3-10】*/
DROP  TABLE  IF  EXISTS  test ; 
/*【例3-11】*/   
USE Bookstore ;
SHOW TABLES ;
/*【例3-12】*/
DESCRIBE book;
/*【例3-13】*/
DESC book 图书编号;
/*【例3-14】*/
CREATE TABLE book_copy
(
    图书编号 varchar(6)  NULL,
    书名 varchar(20)  NOT  NULL  PRIMARY KEY ,
    出版日期 date 
);
/*【例3-15】*/
CREATE TABLE course
(
    学号  		varchar(6)  NOT NULL,
    姓名  		varchar(8)  NOT NULL,
    毕业日期		date	    NOT NULL,
    课程号		varchar(3) ,
    学分			tinyint ,
    PRIMARY  KEY (学号, 课程号, 毕业日期)
);
/*【例3-16】*/
CREATE TABLE course1
(
    学号			varchar(6) 	NOT NULL,
    姓名			varchar(8)	NOT NULL,
    毕业日期		datetime	NOT NULL,
    课程号		varchar(3),
    学分			tinyint ,
    PRIMARY  KEY  INDEX_course(学号, 课程号, 毕业日期)
);
/*【例3-17】*/
CREATE TABLE book_copy1
(
    图书编号 varchar(20) NOT NULL,
    书名     varchar(20) NOT NULL UNIQUE,
    出版日期 date NULL,
    PRIMARY KEY(图书编号)
);

CREATE TABLE book_copy1
(
    图书编号 varchar(20) NULL,
    书名     varchar(20) NOT NULL,
    出版日期 date NULL,
    PRIMARY KEY(图书编号),
    UNIQUE(书名)
);
/*【例3-18】*/
ALTER TABLE Book 
ADD PRIMARY KEY(图书编号), 
    ADD UNIQUE u_idx (书名) ; 
/*【例3-19】*/
ALTER TABLE Book 
    DROP PRIMARY KEY, 
    DROP INDEX u_idx ; 
ALTER TABLE Book 
    DROP PRIMARY KEY, 
    DROP INDEX u_idx ; 
/*【例3-20】*/
CREATE TABLE book_ref
(
    图书编号 varchar(20) NULL,
    书名 varchar(20) NOT NULL,
    出版日期 date NULL,
    PRIMARY KEY (书名),
    FOREIGN KEY (图书编号)
        REFERENCES book (图书编号)
            ON DELETE RESTRICT
            ON UPDATE RESTRICT
);

SELECT  *    FROM  book_ref
    WHERE 图书编号 NOT IN
             (SELECT 图书编号  FROM  book );
/*【例3-21】*/
CREATE TABLE book_ref1
(  
    图书编号 varchar(20) NULL,
    书名 varchar(20) NOT NULL,
    出版日期 date NULL,
    PRIMARY KEY (书名),
    FOREIGN KEY (图书编号)
        REFERENCES book (图书编号)
        ON  UPDATE  CASCADE
);
/*【例3-22】*/
ALTER TABLE sell 
    ADD FOREIGN KEY (用户号) 
        REFERENCES members (用户号) 
            ON DELETE CASCADE 
                ON UPDATE CASCADE;
/*【例3-23】*/
CREATE  TABLE  student
(
    学号 char(6) NOT NULL,
    性别 char(2) NOT NULL CHECK(性别 IN ('男', '女'))
);
/*【例3-24】*/
CREATE  TABLE  student1
(
    学号 char(6)    NOT NULL,
    出生日期 date  NOT NULL,
    学分 int NULL,
    CHECK(出生日期>'2000-01-01')
);
/*【例3-25】*/
CREATE  TABLE  student3
(
    学号 char(6) NOT NULL,
    最好成绩 INT(1) NOT NULL,
    平均成绩 INT(1) NOT NULL,
        CHECK(最好成绩>平均成绩)
);
/*【例3-26】*/
CREATE  TABLE  student4
(
    学号 char(6) NOT NULL,
    最好成绩 INT(1) NOT NULL,
    平均成绩 INT(1) NOT NULL,
        CHECK(最好成绩<=100),
CHECK(最好成绩>平均成绩)
);
/*【例3-27】*/
ALTER TABLE book DROP PRIMARY KEY;
ALTER TABLE book_ref DROP FOREIGN KEY book_ref_ibfk_1;
ALTER TABLE student DROP CHECK student_chk_1;
ALTER TABLE student1 ALTER CHECK student1_chk_1 NOT ENFORCED;
/*第四章*/
/*【例4-1】*/
USE Bookstore;
INSERT INTO book VALUES ( 
        'TP.9501', '计算机', 'Dreamwearer',
        '鲍里拾', '高等教育出版社', '2023-08-16', 33.25,50,0.8, NULL );


/*【例4-2】*/
INSERT INTO book (
        图书编号,书名,作者,出版社,出版时间,单价,数量,折扣 )
    VALUES ( 'TP.9501',  'Dreamwearer', 
        '鲍里拾', '高等教育出版社', '2023-08-16', 33.25, 50, 0.8 );

INSERT INTO book 
SET 图书编号='TP.9501', 书名='Dreamwearer', 
        图书类别=DEFAULT, 作者= '鲍拾里', 出版社='高等教育出版社', 
        出版时间= '2023-08-16', 单价=33.25, 数量=50, 折扣=0.8;

REPLACE INTO book 
    VALUES ( 'TP.9501', '计算机', 'PHP网站制作', '林十伊', 
        '高等教育出版社', '2023-10-16', 23.5, 30, 0.8, NULL);


/*【例4-3】*/
INSERT INTO book 
        VALUES('TP.2467', '计算机', '计算机基础',
        '林时尔', '高等教育出版社', '2023-10-16', 45.5, 45, 0.8,
        'D:\pic\ic.jpg' );

/*【例4-4】*/
INSERT INTO members  VALUES 
        ('C0138', '李华','女','123456','13822551234' ,'2023-8-23'),
        ('C0139', '张明','男', '123456','13822555432' ,'2023-9-23');

/*【例4-5】*/
UPDATE book
    SET 数量 = 数量+10;
UPDATE members
    SET 联系电话 ='13802551234' , 密码 ='111111' 
        WHERE 姓名 = '张三';

/*【例4-6】*/
UPDATE  sell ,book
    SET  sell.订购册数=订购册数-2 , book.数量=数量+2
        WHERE sell.图书编号=book.图书编号 and sell.订单号='6';

/*【例4-7】*/
USE Bookstore;
DELETE FROM members
        WHERE 姓名='张三';

/*【例4-8】*/
USE Bookstore;
DELETE FROM book
        WHERE 数量<5;

/*【例4-9】*/
DELETE sell,members
    FROM sell,members
        WHERE sell.用户号=members.用户号
            AND members.用户号='D1963';
DELETE
    FROM sell,members 
    USING sell,members
        WHERE sell.用户号=members.用户号 
            AND members.用户号='D1963';

/*第五章*/

/*【例5-1】*/
USE Bookstore;
SELECT 姓名,联系电话,注册时间 
    FROM members;
SELECT * FROM members;
/*【例5-2】*/
SELECT 书名 AS name, 作者 AS auther, 出版社 AS publisher
    FROM book
        WHERE 图书类别= '计算机';
SELECT 书名 AS ' Name of  Book', 作者 AS 'Name  of  Auther', 
        出版社 AS Publisher
    FROM book   WHERE 图书类别= '计算机';
 SELECT 书名 AS ' Name of  Book', 作者 AS 'Name  of  Auther', 
        出版社 AS Publisher
    FROM book   WHERE 图书类别= '计算机';
/*【例5-3】*/
SELECT 图书编号, 书名,
    CASE 
            WHEN 数量 IS NULL THEN  '尚未进货'
            WHEN 数量 < 5 THEN  '需进货'
            WHEN 数量 >=5 and 数量<=50 THEN  '库存正常'
            ELSE  '库存积压'
        END  AS  库存
FROM book;

/*【例5-4】*/
SELECT  图书编号, ROUND(订购册数*订购单价,2)  AS 订购金额
        FROM   sell   
            WHERE 是否发货= '已发货';

/*【例5-5】*/
SELECT DISTINCT 图书类别, 出版社   FROM book;
/*【例5-6】*/
SELECT  * 
    FROM  book
        WHERE 书名='网页程序设计';

/*【例5-7】*/
SELECT *
    FROM  book
        WHERE 单价>30;

/*【例5-8】*/
SELECT 订单号,订购时间,是否收货
    FROM sell
        WHERE 是否收货<=>NULL;
/*【例5-9】*/
SELECT * 
    FROM sell
        WHERE  是否收货='已收货'  AND 是否结清='已结清';

/*【例5-10】*/
SELECT *   FROM  book
    WHERE  (出版社='清华大学出版社' OR 出版社='北京大学出版社' )
        AND 单价>=35;
SELECT  *   FROM  book
    WHERE  (出版社='清华大学出版社'  AND 单价>=35) 
        OR  (出版社='北京大学出版社'  AND 单价>=35);
SELECT *   FROM  book 
    WHERE  出版社='清华大学出版社'  OR 出版社='北京大学出版社' 
        AND 单价>=35;

/*【例5-11】*/
SELECT 用户号,姓名,注册时间
    FROM members 
        WHERE  姓名  LIKE  '李%';
SELECT 用户号,姓名,注册时间
    FROM members 
        WHERE  姓名  LIKE  '李__';


/*【例5-12】*/
SELECT 图书编号, 书名   FROM  book 
        WHERE 图书编号 LIKE  '%6_';

/*【例5-13】*/
SELECT 图书编号,书名
    FROM   book 
        WHERE 书名 LIKE '%#_%'ESCAPE  '#';

/*【例5-14】*/
SELECT  *
    FROM book 
        WHERE 出版时间  BETWEEN  '2023-1-1'  AND  '2023-12-31';

SELECT  *
    FROM book 
        WHERE 出版时间>= '2023-1-1'  AND  出版时间<='2023-12-31';

 SELECT  *
    FROM book 
        WHERE 出版时间>= '2023-1-1'  AND  出版时间<='2023-12-31';

SELECT  *
    FROM book 
        WHERE 出版时间<= '2023-1-1'  OR  出版时间>='2023-12-31';


/*【例5-15】*/
SELECT *  FROM book
    WHERE 出版社 IN ( '高等教育出版社', '北京大学出版社',
                        '人民邮电出版社');
SELECT *  FROM book
    WHERE 出版社='高等教育出版社'  OR 出版社='北京大学出版社' 
                    OR 出版社= '人民邮电出版社' ;

/*【例5-16】*/
SELECT *   FROM sell 
        WHERE 是否发货 IS NULL;

/*【例5-17】*/
SELECT * 
    FROM  members AS Users;


/*【例5-18】*/
SELECT  book.书名, sell.订购册数, sell.订购时间
        FROM  book, sell 
            WHERE book.图书编号=sell.图书编号;

/*【例5-19】*/
SELECT  book.书名, sell.订购册数, sell.订购时间
    FROM  book INNER JOIN sell 
        ON  (book.图书编号=sell.图书编号);

/*【例5-20】*/
SELECT 书名,订购册数
    FROM book JOIN sell
        ON book.图书编号 = sell. 图书编号
            WHERE 书名 = 'MYSQL数据库'  AND 订购册数>5

/*【例5-21】*/
SELECT book.图书编号, 姓名, 书名, 订购册数
    FROM  sell  JOIN  book  ON  book. 图书编号= sell.图书编号
        JOIN   members   ON  sell.用户号 = members.用户号
            WHERE 书名 = 'MYSQL数据库'  AND 订购册数>5 ;

/*【例5-22】*/
SELECT DISTINCT a.订单号,a.图书编号,a.订购册数
    FROM  sell  AS  a  JOIN  sell  AS  b 
        ON  a. 图书编号=b. 图书编号 AND a. 订单号!=b. 订单号;
/*【例5-23】*/
SELECT  DISTINCT 姓名 FROM members
        JOIN  sell USING (用户号);
SELECT  DISTINCT 姓名
    FROM Members JOIN  Sell 
    ON Members.用户号=Sell.用户号 ;

/*【例5-24】*/
 SELECT book.图书编号,book.单价,用户号
     FROM book LEFT OUTER JOIN sell
 ON book.图书编号= sell.图书编号 AND 图书类别='计算机';
/*【例5-25】*/
SELECT 订单号,图书编号,订购册数, members.姓名, members.联系电话
    FROM sell RIGHT JOIN members
        ON members.用户号= sell.用户号 AND 性别='男';

/*【例5-26】*/
SELECT *
    FROM sell
      WHERE  用户号 IN
              ( SELECT 用户号 FROM  members WHERE 姓名 = '张三' );

/*【例5-27】*/
SELECT * FROM  members 	WHERE  用户号 IN
    (SELECT 用户号  FROM  sell  WHERE  图书编号 NOT  IN 
        ( SELECT 图书编号 FROM  book  WHERE  书名='MYSQL数据库'));

/*【例5-28】*/
SELECT * FROM members  WHERE  用户号=ANY
            (SELECT 用户号 FROM sell 
                 WHERE 图书编号='TP.2525');
SELECT 用户号 FROM sell	WHERE 图书编号='TP.2525';
 SELECT * FROM members  WHERE  用户号 IN
    (SELECT 用户号 FROM sell	WHERE 图书编号='TP.2525');
/*【例5-29】*/
SELECT  图书编号,图书类别,单价  FROM  book
      WHERE  单价>ALL
        (SELECT 单价 FROM book WHERE 图书类别='网页设计' );

SELECT 图书类别,书名,单价 FROM book WHERE 图书类别='网页设计';
/*【例5-30】*/
SELECT 图书编号,订购册数 FROM  sell  WHERE 订购册数>SOME 
    (SELECT 订购册数 FROM sell WHERE 图书编号 ='Ts.3035' );
SELECT 图书编号,订购册数 FROM sell WHERE 图书编号 ='Ts.3035';
/*【例5-31】*/
SELECT 姓名 FROM members WHERE EXISTS
    ( SELECT  *  FROM  Sell  
        WHERE  用户号= members.用户号 AND  订购册数>10);

/*【例5-32】*/
SELECT 订单号, 用户号,图书编号,订购册数 FROM sell WHERE 用户号= 'C0138'; 
SELECT 订单号, 用户号,图书编号,订购册数 FROM sell WHERE 图书编号= 'TP.2525'; 
SELECT 订单号, 用户号,图书编号,订购册数 FROM sell WHERE 用户号= 'C0138 ' 
UNION 
SELECT 订单号, 用户号,图书编号,订购册数 FROM sell WHERE 图书编号= 'TP.2525'; 


SELECT 订单号, 用户号,图书编号,订购册数 FROM sell WHERE 用户号= 'C0138 ' 
UNION ALL
SELECT 订单号, 用户号,图书编号,订购册数 FROM sell WHERE 图书编号= 'TP.2525'; 
/*【例5-33】*/
SELECT 图书编号,订购册数,订购单价 FROM sell WHERE 订购册数>30; 
SELECT 图书编号,数量,单价 FROM book WHERE 数量>50; 
SELECT 图书编号,数量,单价 FROM book WHERE 数量>50; 
(SELECT 图书编号,订购册数,订购单价 FROM sell WHERE 订购册数>30 
ORDER BY 订购单价 LIMIT 2) 
UNION ALL 
(SELECT 图书编号,数量,单价 FROM book WHERE 数量>50 ORDER BY 单价  LIMIT 2 );

/*【例5-34】*/
 SELECT COUNT(*) AS  '会员数' FROM members;
/*【例5-35】*/
SELECT COUNT(是否收货)  AS  '已收货的订单数'  FROM  sell;
/*【例5-36】*/
SELECT COUNT(订购册数)  AS  '订购册数在5以上的订单数'
    FROM sell  WHERE 订购册数>5;

/*【例5-37】*/
SELECT MAX(订购册数), MIN(订购册数)
    FROM sell
        WHERE  图书编号 = 'Ts.3035';

/*【例5-38】*/
SELECT SUM(订购册数)  AS  '订购总册数'
    FROM sell  WHERE  图书编号 = 'Ts.3035';

/*【例5-39】*/
SELECT AVG(订购册数)  AS  '每笔订单平均册数'
    FROM sell   WHERE  图书编号 = 'Ts.3035';
/*【例5-40】*/
SELECT 图书类别
    FROM book
        GROUP BY 图书类别;

/*【例5-41】*/
SELECT 图书类别,sum(数量)  AS  '库存数'
    FROM book
        GROUP BY 图书类别;

/*【例5-42】*/
SELECT 图书编号, ROUND(AVG(订购册数),2) AS '订购册数' ,
    COUNT(订单号) AS '订单数'
        FROM sell 
            GROUP BY 图书编号;


/*【例5-43】*/
SELECT 图书类别, 出版社, Sum(数量) AS '库存数'
    FROM book  GROUP BY 图书类别, 出版社;
SELECT 图书类别, 出版社, Sum(数量) AS '库存数'
    FROM book
        GROUP BY 图书类别, 出版社   
            WITH  ROLLUP;	

/*【例5-44】*/
SELECT 用户号, ROUND(AVG(订购册数),2) AS '平均订购册数'
    FROM sell
        GROUP BY 用户号
            HAVING AVG(订购册数) >5;

SELECT 用户号, ROUND(AVG(订购册数),2) AS '平均订购册数'
    FROM sell
        GROUP BY 用户号;


/*【例5-45】*/
SELECT 用户号,订购册数  FROM sell  WHERE 订购册数 >5;
SELECT 用户号,count(*)  FROM sell  WHERE 订购册数 >5
    GROUP BY 用户号;
SELECT 用户号
    FROM sell
        WHERE 订购册数 >5
            GROUP BY 用户号
                HAVING COUNT(*) >= 2;
/*【例5-46】*/
SELECT *   FROM book
    ORDER BY 出版时间;
/*【例5-47】*/
SELECT *    FROM sell
    ORDER BY 订购册数 DESC;

/*【例5-48】*/
SELECT *	FROM members
    ORDER BY 注册时间
        LIMIT 5;

/*【例5-49】*/
SELECT *	FROM book
        ORDER BY 图书编号
        LIMIT 3, 5;
/*第六章*/
/*【例6-1】*/
CREATE OR REPLACE VIEW  jsj_sell 
    AS
        SELECT 订单号,sell.图书编号,书名,订购册数
            FROM  book,  sell
            WHERE  book.图书编号=sell. 图书编号 
                AND  book.图书类别= '计算机'
            WITH CHECK OPTION;

SELECT 订单号,sell.图书编号,书名,订购册数 FROM  book,  sell 
WHERE  book.图书编号=sell. 图书编号 AND  book.图书类别= '计算机';

/*【例6-2】*/
CREATE VIEW sale_avg (name, sale_avg)
AS
SELECT 书名,avg(订购册数) 
    FROM  jsj_sell  
GROUP BY 书名;
/*【例6-3】*/
SELECT 订单号, 订购册数
    FROM  jsj_sell;

/*【例6-4】*/
CREATE VIEW  kh_avg ( userID, order_avg )
    AS 
    SELECT 用户号, AVG(订购册数)
        FROM  sell
        GROUP BY 用户号;

/*【例6-5】*/
CREATE OR REPLACE VIEW jsj_book 
    AS 
    SELECT *
        FROM book
        WHERE 图书类别 = '计算机'
    WITH CHECK OPTION;
 
INSERT INTO jsj_book
    VALUES(
    'TP.0837','计算机','Office应用实例','张拾怡',
    '人民邮电出版社','2023-10-21',34.5,NULL,NULL,NULL);

/*【例6-6】*/
UPDATE jsj_book
    SET 单价 = 单价*(1-0.05);

/*【例6-7】*/
UPDATE  jsj_sell 
    SET 书名='PHP网站制作'
    WHERE 图书编号='TP.2525';
UPDATE  jsj_sell
    SET 订购册数=100
    WHERE 订单号=5;
/*【例6-8】*/
DELETE FROM jsj_book
    WHERE 出版社 ='人民邮电出版社';
/*【例6-9】*/
ALTER VIEW jsj_book
AS
    SELECT 图书编号,书名,单价  FROM  book
        WHERE 图书类别 = '计算机';
/*第七章*/
/*【例7-1】*/
CREATE INDEX  name_book
    ON   book(书名(6)  ASC);

/*【例7-2】*/
CREATE INDEX  user_bh?_sell 
    ON   sell(用户号,图书编号);

/*【例7-3】*/
ALTER TABLE book
    ADD INDEX (书名);
/*【例7-4】*/
ALTER TABLE book
    ADD PRIMARY KEY(图书编号),
        ADD INDEX (出版社,出版时间);
SHOW INDEX FROM book;
/*【例7-5】*/
CREATE TABLE sell_copy (
	用户号   CHAR(18) NOT NULL,
	图书编号   CHAR(20) NOT NULL,
	订购册数   INT(5),
	订购时间   DATETIME,
	PRIMARY KEY(用户号, 图书编号),
	INDEX (订购册数)
);

/*【例7-6】*/
DROP INDEX 书名 ON book;
/*【例7-7】*/
 ALTER TABLE book
    DROP PRIMARY KEY,
    DROP INDEX name_book;
/*【例7-8】*/
ALTER TABLE book
    ADD INDEX (出版社) INVISIBLE;

/*【例7-9】*/
alter table sell
    partition by range(year(订购时间))
    (partition p1 values less than (2020),
    partition p2 values less than (2022),
    partition p3 values less than maxvalue);

SELECT
 PARTITION_NAME part,
 PARTITION_EXPRESSION expr,
 PARTITION_DESCRIPTION descr,
 TABLE_ROWS
 FROM INFORMATION_SCHEMA.PARTITIONS
 WHERE TABLE_SCHEMA=SCHEMA() AND TABLE_NAME = 'sell';

/*【例7-10】*/
alter table sell
    partition by list (是否结清)
    (partition p1 values in (1),
    partition p2 values in (0));
SELECT
 PARTITION_NAME part,
 PARTITION_EXPRESSION expr,
 PARTITION_DESCRIPTION descr,
 TABLE_ROWS
 FROM INFORMATION_SCHEMA.PARTITIONS
 WHERE TABLE_SCHEMA=SCHEMA() AND TABLE_NAME = 'sell';

/*【例7-11】*/
ALTER TABLE bookstore.sell
ADD PRIMARY KEY (订单号);

alter table sell
    partition by hash(订单号) partitions  3;
SELECT
 PARTITION_NAME part,
 PARTITION_EXPRESSION expr,
 PARTITION_DESCRIPTION descr,
 TABLE_ROWS
 FROM INFORMATION_SCHEMA.PARTITIONS
 WHERE TABLE_SCHEMA=SCHEMA() AND TABLE_NAME = 'sell';

/*【例7-12】*/
alter table sell
    partition by Key() partitions  3;
SELECT
 PARTITION_NAME part,
 PARTITION_EXPRESSION expr,
 PARTITION_DESCRIPTION descr,
 TABLE_ROWS
 FROM INFORMATION_SCHEMA.PARTITIONS
 WHERE TABLE_SCHEMA=SCHEMA() AND TABLE_NAME = 'sell';
/*【例7-13】*/
ALTER TABLE sell 
ADD PARTITION (PARTITION p3 VALUES IN (2));

/*【例7-14】*/
ALTER TABLE sell
REORGANIZE PARTITION  p2,p3 INTO (PARTITION m VALUES IN (0,2));

/*【例7-15】*/
ALTER TABLE sell
DROP PARTITION p1;

/*【例7-16】*/
ALTER TABLE sell 
REMOVE PARTITIONING ;
/*第8章*/
/*【例8-1】*/
SET @b_name=
(SELECT 书名 FROM book WHERE 图书编号='Ts.3035');
SELECT * FROM book  WHERE 书名=@b_name;
/*【例8-2】*/
SELECT SUBSTRING(姓名, 1,1) AS 姓, 
    SUBSTRING(姓名, 2, LENGTH(姓名)-1)  AS 名
    FROM members  ORDER BY 姓名;

/*【例8-3】*/
SELECT 会员姓名, YEAR(NOW())-YEAR(注册时间)  AS 注册年数   FROM members;

/*【例8-4】*/
SELECT 姓名, IF(性别='男', 1, 0)  AS 性别
    FROM members 
        WHERE 姓名 LIKE '__';

/*【例8-5】*/
IF K1>K2 THEN
    SET K3 = '大于';
ELSEIF K1=K2 THEN
    SET K3 = '等于';
ELSE 
    SET K3 = '小于';
END IF;


/*【例8-6】*/
（1）
    CASE str
    WHEN 'U' THEN SET direct ='上升';
    WHEN 'D' THEN SET direct ='下降';
    ELSE  SET direct ='不变';
    END CASE;
/*【例8-7】*/
    CASE 
    WHEN str=' U' THEN SET direct ='上升';
    WHEN str=' D' THEN SET direct ='下降';
    ELSE  SET direct ='不变';
    END CASE;


/*【例8-8】*/
（1）
DECLARE a INT DEFAULT 5;
WHILE  a > 0  DO
    SET a = a-1;
END WHILE;
（2）
REPEAT 
    a=a-1;
    UNTIL a<1
END REPEAT;
（3）
REPEAT 
    a=a-1;
    UNTIL a<1;
END REPEAT;

/*【例8-9】*/

DELIMITER $$
CREATE PROCEDURE  del_member(IN xm  CHAR(8))
BEGIN
    DELETE FROM members WHERE 姓名=xm;
END $$
DELIMITER ;
/*【例8-10】*/
SELECT作者,出版社 INTO name, publish 
    FROM book WHERE 书名= '计算机基础';

/*【例8-11】*/
CREATE PROCEDURE query_members()
    SELECT COUNT(*) FROM members;
CALL query_members();
/*【例8-12】*/
  DELIMITER $$
    CREATE PROCEDURE q_quarter
            (IN mon int, OUT q_name VARCHAR(8) )
    BEGIN
        CASE 
            WHEN mon in (1,2,3) THEN SET q_name ='一季度';
            WHEN mon in (4,5,6) THEN SET q_name ='二季度';
            WHEN mon in (7,8,9) THEN SET q_name ='三季度';
            WHEN mon in (10,11,12) THEN SET q_name ='四季度';
        ELSE  SET q_name ='输入错误';
        END CASE;
    END$$
DELIMITER ;
CALL q_quarter (6, @R);
select @r;

/*【例8-13】*/
DELIMITER $$
CREATE PROCEDURE 
        dj_update(IN c_name  CHAR(8), IN b_name CHAR(20))
BEGIN
    DECLARE  bh CHAR(20);
    DECLARE  yhh CHAR(10);
    DECLARE  sl TINYINT;
    SELECT 用户号 INTO yhh  FROM members 
        WHERE  姓名=c_name;
    SELECT 图书编号 INTO bh  FROM book WHERE  书名=b_name;
    SELECT 订购册数 INTO sl FROM sell 
        WHERE 用户号=yhh AND 图书编号=bh;
    IF sl>=5 AND sl<=10 THEN
        UPDATE sell SET 订购单价=订购单价*0.9 
                WHERE 用户号=yhh AND 图书编号=bh;
    ELSE 
        IF sl>10 THEN
            UPDATE sell SET 订购单价=订购单价*0.8     
                WHERE 用户号=yhh AND 图书编号=bh;
        END IF;
    END IF;
  END$$
DELIMITER ;

/*【例8-14】*/
DELIMITER $$
CREATE PROCEDURE 
        dj_update(IN c_name  CHAR(8), IN b_name CHAR(20))
BEGIN
    DECLARE  bh CHAR(20);
    DECLARE  yhh CHAR(10);
    DECLARE  sl TINYINT;
    SELECT 用户号 INTO yhh  FROM members 
        WHERE  姓名=c_name;
    SELECT 图书编号 INTO bh  FROM book WHERE  书名=b_name;
    SELECT 订购册数 INTO sl FROM sell 
        WHERE 用户号=yhh AND 图书编号=bh;
    IF sl>=5 AND sl<=10 THEN
        UPDATE sell SET 订购单价=订购单价*0.9 
                WHERE 用户号=yhh AND 图书编号=bh;
    ELSE 
        IF sl>10 THEN
            UPDATE sell SET 订购单价=订购单价*0.8     
                WHERE 用户号=yhh AND 图书编号=bh;
        END IF;
    END IF;
  END$$
DELIMITER ;
/*调用前*/

SELECT 姓名,书名,订购单价,订购册数 
    FROM sell JOIN book ON sell.图书编号=book.图书编号
        JOIN members ON sell.用户号= members.用户号 
            WHERE 书名='PHP高级语言' AND 姓名='张三';
CALL dj_update ('张三', 'PHP高级语言');
/*调用后*/

SELECT 姓名,书名,订购单价,订购册数 
    FROM sell JOIN book ON sell.图书编号=book.图书编号
        JOIN members ON sell.用户号= members.用户号 
            WHERE 书名='PHP高级语言' AND 姓名='张三';
/*【例8-14】*/
DELIMITER $$
CREATE PROCEDURE dj_s(in c_no char(6))
begin
  declare dj float(5,2);
  declare cs int;
  declare ddh char(10);
  declare done int default false; 
  declare dj_c cursor for select 订单号,订购单价,订购册数 from sell where 用户号=c_no;
  declare continue HANDLER for not FOUND set done = true;
  open dj_c;
  fetch dj_c into ddh,dj,cs;
  while(not done) do 
    set dj=dj*0.8;
    if(dj>100) then set dj=dj*0.9;
    end if;
    if(dj<=20 and cs<=5) then set dj=dj/0.8;
    end if;
    if( not done) then update sell set 订购单价=dj where 用户号=c_no and 订单号=ddh;end if;
    fetch dj_c into ddh,dj,cs;
  end while;
  close dj_c; 
  end $$
DELIMITER;

select 订单号,订购单价,订购册数 from sell where 用户号='c0138';
CALL dj_s('c0138');
 select 订单号,订购单价,订购册数 from sell where 用户号='c0138';
/*【例8-15】*/

delimiter $$
create procedure xg_b(in c_cbs char(20))
    begin
    declare bh char(20);
    declare sl int;
    declare state char(10) default 'ok';
    declare xg_c cursor for select 图书编号,数量 from book where 出版社=c_cbs;
    declare continue handler for 1329 set state='error';
    open xg_c;
    repeat
      fetch xg_c into bh,sl; set sl=sl+5;
      if(sl>=50) then set sl=50;
      end if;
      if(sl<=10) then set sl=10;
      end if;
      If state='ok' then
      update book set 数量=sl where 图书编号=bh;
      end if;
    until state='error'
    end repeat;
    close xg_c;
    end $$
delimiter;

select 图书编号,数量 from book where 出版社='中国青年出版社';

CALL xg_b('中国青年出版社');

select 图书编号,数量 from book where 出版社='中国青年出版社';
/*【例8-16】*/
CREATE PROCEDURE sell_insert()
  INSERT INTO sell
    VALUES(10,'C0132', 'TP.2462',4, 30, '2023-03-05', NULL, NULL, NULL);

DELIMITER $$
CREATE PROCEDURE sell_update
(IN X INT(1), OUT STR CHAR(8))
BEGIN
    CALL sell_insert();
    CASE
        WHEN x=0 THEN
            UPDATE sell SET 是否发货='已发货' WHERE 订单号=10; 
            SET STR='修改成功';
        WHEN X=1 THEN
            DELETE FROM sell WHERE 订单号=10;
            SET STR='删除成功';
        END CASE;
    END $$
DELIMITER;


CALL sell_update (1, @str);
SELECT @str;

CALL sell_update (0, @str);
SELECT @str;
/*【例8-17】*/
 DELIMITER $$
CREATE FUNCTION num_book()
RETURNS INTEGER DETERMINISTIC
BEGIN
    RETURN (SELECT COUNT(*) FROM Book);
END$$
DELIMITER ;
select num_book();
/*【例8-18】*/
DELIMITER $$
CREATE FUNCTION author_book(b_name CHAR(20))
RETURNS CHAR(8) 
DETERMINISTIC
BEGIN
    RETURN (SELECT 作者 FROM book WHERE 书名= b_name);
END$$
DELIMITER ;
 select author_book('计算机应用基础');
/*【例8-19】*/
DELIMITER $$
CREATE FUNCTION del_Sell(b_bh CHAR(20))
    RETURNS BOOLEAN 
    DETERMINISTIC
BEGIN
    DECLARE bh CHAR(20);
    SELECT 图书编号 INTO bh FROM book WHERE 图书编号=b_bh;
    IF bh IS NULL THEN
        DELETE FROM sell WHERE 图书编号=b_bh; 
        RETURN TRUE;
    ELSE 
        RETURN FALSE;
    END IF;
END$$
DELIMITER ;

select del_sell('TP.2462');
/*【例8-20】*/
DELIMITER $$
CREATE FUNCTION publish_book(b_name CHAR(20))
    RETURNS CHAR(20)
DETERMINISTIC
BEGIN
    DECLARE name CHAR(20);
    SELECT author_book(b_name) INTO name;
    IF name like '张%'  THEN
        RETURN(SELECT 出版时间 FROM book WHERE 书名= b_name);
    ELSE 
        RETURN '不合要求';
    END IF;
END$$
DELIMITER ;
SELECT publish_book('计算机网络技术');
SELECT publish_book('ORACLE');

/*【例8-21】*/
CREATE TRIGGER members_insert AFTER INSERT
    ON members FOR EACH ROW
        SET @str= '一个用户已添加';
INSERT INTO members 
    VALUES('E0111','王五','男','000000','15011112233',NULL);
SELECT @str;

/*【例8-22】*/
DELIMITER $$
CREATE TRIGGER book_del AFTER DELETE
    ON Book FOR EACH ROW
BEGIN
    DELETE FROM sell WHERE 图书编号=OLD.图书编号;
END$$
DELIMITER ;
DELETE FROM book WHERE 图书编号='Tw.1283';
SELECT * FROM sell WHERE 图书编号='Tw.1283';
/*【例8-23】*/
DELIMITER $$
CREATE TRIGGER sell_update BEFORE UPDATE
    ON sell FOR EACH ROW
BEGIN
    IF NEW.订购册数<5 THEN
        UPDATE book SET 折扣=1 WHERE 图书编号=NEW.图书编号;
ELSE 
        UPDATE book SET 折扣=0.8 WHERE 图书编号=NEW.图书编号;
    END IF;
END$$
DELIMITER ;

UPDATE sell SET 订购册数=4
   WHERE 图书编号='TP.2525'  AND 用户号='C0132';

SELECT 图书编号,折扣 FROM book WHERE 图书编号='TP.2525';

UPDATE sell SET 订购册数=40 
    WHERE 图书编号='TP.2525'  AND 用户号='C0132';

SELECT图书编号,折扣FROM book WHERE 图书编号='TP.2525';


/*【例8-24】*/
DELIMITER $$
CREATE TRIGGER sell_ins AFTER INSERT
    ON sell FOR EACH ROW
BEGIN
    IF NEW.订购册数>10 THEN
        UPDATE book SET 折扣=折扣*0.95 WHERE 图书编号=NEW.图书编号;
    END IF;
END$$
DELIMITER ;

SELECT 图书编号,书名,折扣 FROM book WHERE 图书编号='TP.6625';

 INSERT INTO sell 
    VALUES(11,'B0022', 'TP.6625',42, 30, '2023-03-05', NULL, NULL, NULL);


SELECT 图书编号,书名,折扣 FROM book 
    WHERE 图书编号='TP.6625';



/*【例8-25】*/
DELIMITER $$
CREATE EVENT event_update ON SCHEDULE EVERY 1 MINUTE 
STARTS CURDATE() + INTERVAL 1 MINUTE
DO
  BEGIN
      UPDATE sell set 订购册数=订购册数+1 where 订单号=1;
  END$$
DELIMITER;





/*第9章*/
/*【例9-1】*/
CREATE USER usr1@localhost IDENTIFIED BY '123456';
/*【例9-2】*/
CREATE USER usr2@localhost IDENTIFIED BY '123' PASSWORD EXPIRE;
/*【例9-3】*/
CREATE USER usr3@localhost IDENTIFIED BY '123' 
PASSWORD EXPIRE INTERVAL 180 DAY
FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 2;

/*【例9-4】*/
SET PASSWORD FOR usr1@localhost= 'queen';
/*【例9-5】*/
DROP USER usr1@localhost;
/*【例9-6】*/
RENAME USER
    usr2@localhost TO user1@localhost,
    usr3@localhost TO user2@localhost;
/*【例9-7】*/
USE Bookstore;
GRANT SELECT
    ON  book 
        TO user1@localhost;

/*【例9-8】*/
USE Bookstore;
GRANT UPDATE(图书编号, 书名)
ON  book
    TO  user1@localhost;

USE Bookstore;
UPDATE Book SET 书名='计算机应用基础II' 
    WHERE 图书编号='TP.2462';

UPDATE Book SET 出版社='中国青年出版社' 
    WHERE 图书编号='TP.2462';


/*【例9-9】*/
GRANT SELECT
    ON  Bookstore.* 
        TO  user1@localhost;

/*【例9-10】*/
GRANT SELECT
    ON  Bookstore.* 
        TO  user1@localhost;

/*【例9-11】*/
GRANT  CREATE ,ALTER ,DROP
    ON  *.*
        TO  user2@localhost;

/*【例9-12】*/
GRANT  CREATE  USER
    ON  *.*
        TO  user2@localhost;

/*【例9-13】*/
GRANT SELECT
    ON  Bookstore.sell
    TO  user2@localhost
    WITH GRANT OPTION;
/*user2登录*/
CREATE USER user3@localhost IDENTIFIED BY '123456';
GRANT SELECT
    ON  Bookstore.sell
        TO user3@localhost;

/*【例9-14】*/
REVOKE  SELECT
    ON  Bookstore.sell
        FROM  user2@localhost;

/*【例9-15】*/
REVOKE ALL PRIVILEGES, GRANT OPTION    
        FROM  user2@localhost;

/*【例9-16】*/
USE Bookstore;
SELECT * FROM  members
    INTO OUTFILE 'D:/myfile1.txt';

/*【例9-17】*/
USE Bookstore;
SELECT * FROM  members
    INTO OUTFILE 'D:/myfile2.txt'
        FIELDS  TERMINATED BY ','
            OPTIONALLY ENCLOSED BY '"'
        LINES TERMINATED BY '#';
/*【例9-18】*/
CREATE TABLE member_copy1 LIKE members;

 LOAD DATA INFILE 'D:/myfile1.txt'
    INTO TABLE member_copy1;
/*【例9-19】*/
CREATE TABLE member_copy2 LIKE members;
LOAD DATA INFILE 'D:/myfile2.txt'
    INTO TABLE member_copy2
        FIELDS  TERMINATED BY ','
                OPTIONALLY ENCLOSED BY '"'
            LINES TERMINATED BY '#';

/*【例9-20】*/

mysqlbinlog bin_log.000001

RESET MASTER;
/*【例9-21】*/
PURGE MASTER LOGS BEFORE '2023-12-16 13:00:00';
/*【例9-22】*/
SET @@AUTOCOMMIT=0; #关闭自动提交，开启事务
SELECT 密码 AS 事务前密码 FROM Bookstore.Members WHERE 姓名='张三';
BEGIN；
UPDATE Bookstore.Members SET 密码='111111' WHERE 姓名='张三';
SELECT 密码 AS 事务中密码 FROM Bookstore.Members WHERE 姓名='张三';
ROLLBACK;
SELECT 密码 AS 事务后密码 FROM Members WHERE 姓名='张三';

