/*第三章Petstore数据库源代码：*/
/*3.5.2创建Petstore数据库与表*/
/*1*/
CREATE DATABASE petstore；
/*2*/
USE Petstore;
CREATE TABLE account (
  userid char(6) NOT NULL ,
  fullname varchar(10) NOT NULL,
  password varchar(20) NOT NULL,
  sex char(2) NOT NULL,
  address varchar(40) NULL,
  email varchar(20) NULL,
  phone varchar(11) NOT NULL,
  PRIMARY KEY (userid)
);
/*3*/
CREATE TABLE category (
  catid char(10) NOT NULL,
  catname varchar(20) NULL,
  cades text NULL,
  PRIMARY KEY (catid)
);
/*4*/
CREATE TABLE product (
  productid char(10) NOT NULL,
  catid char(10) NOT NULL,
  name varchar(30) NULL,
  descn text NULL,
  listprice decimal(10,2) NULL,
  unitcost decimal(10,2) NULL,
  qty int(11) NOT NULL,
  PRIMARY KEY (productid)
);
/*5*/
CREATE TABLE product (
  productid char(10) NOT NULL,
  catid char(10) NOT NULL,
  name varchar(30) NULL,
  descn text NULL,
  listprice decimal(10,2) NULL,
  unitcost decimal(10,2) NULL,
  qty int(11) NOT NULL,
  PRIMARY KEY (productid)
);
/*6*/
CREATE TABLE lineitem (
  orderid int(11) NOT NULL,
  itemid char(10) NOT NULL,
  quantity int(11) NOT NULL,
  unitprice decimal(10,2) NOT NULL,
  PRIMARY KEY (orderid,itemid)
) ;
/*3.5.3  建立数据完整性约束*/
/*1*/
ALTER TABLE orders 
   ADD FOREIGN KEY (userid)
        REFERENCES account(userid)
            ON DELETE RESTRICT
            ON UPDATE RESTRICT;
/*2*/
ALTER TABLE orders 
   ADD FOREIGN KEY (userid)
        REFERENCES account(userid)
            ON DELETE RESTRICT
            ON UPDATE RESTRICT;
/*3*/
ALTER TABLE lineitem
    ADD FOREIGN KEY (itemid)
        REFERENCES product(productid)
            ON DELETE CASCADE
            ON UPDATE CASCADE;

/*4*/
ALTER TABLE lineitem
    ADD FOREIGN KEY (orderid)
        REFERENCES orders(orderid)
            ON DELETE CASCADE;
/*5*/
ALTER  TABLE  account ADD  CHECK(sex IN ('男', '女'));

/*第4章*/
/*4.4.2  Petstore数据录入*/
/*1*/
INSERT INTO account 
    VALUES('u0001', '刘晓和', '123456', '男', '广东深圳市',
        'liuxh@163.com', '13512345678');
INSERT INTO account
    VALUES ('u0002', '张嘉庆', '123456', '男', '广东深圳市', 
        'zhangjq@163.com', '13512345679');
INSERT INTO account
    VALUES ('u0003', '罗红红', '123456', '女', '广东深圳市',
        'longhh@163.com', '13512345689');
INSERT INTO account
    VALUES ('u0004', '李昊华', '123456', '女', '广东广州市', 
        'lihh@163.com', '13812345679');
INSERT INTO account 
    VALUES ('u0005', '吴美霞', '123456', '女', '广东珠海市', 
        'wumx@163.com', '13512345879');
INSERT INTO account
    VALUES('u0006', '王天赐', '123456', '男', '广东中山市', 
        'wangtc@163.com', '13802345679');
/*2*/
INSERT INTO category VALUES ('01', '鸟类', '');
INSERT INTO category VALUES ('02', '猫', '');
INSERT INTO category VALUES ('03', '狗', '');
INSERT INTO category VALUES ('04', '鱼', '');
INSERT INTO category VALUES ('05', '爬行类', '');

/*3*/
INSERT INTO product VALUES ('AV-CB-01', '01', '亚马逊鹦鹉', '75 岁以上高龄的好伙伴', 50.00, 60.00, 100);
INSERT INTO product VALUES ('AV-SB-02', '01', '燕雀', '非常好的减压宠物', 45.00, 50.00, 98);
INSERT INTO product VALUES ('FI-FW-01', '04', '锦鲤', '来自日本的淡水鱼', 45.50, 45.50, 300);
INSERT INTO product VALUES ('FI-FW-02', '04', '金鱼', '来自中国的淡水鱼', 6.80, 6.80, 100);
INSERT INTO product VALUES ('FI-SW-01', '04', '天使鱼', '来自澳大利亚的海水鱼', 10.00, 10.00, 100);
INSERT INTO product VALUES ('FI-SW-02', '04', '虎鲨', '来自澳大利亚的海水鱼', 18.50, 20.00, 200);
INSERT INTO product VALUES ('FL-DLH-02', '02', '波斯猫', '友好的家居猫, 像公主一样高贵', 1000.00, 1200.00, 15);
INSERT INTO product VALUES ('FL-DSH-01', '02', '马恩岛猫', '灭鼠能手', 80.00, 100.00, 40);
INSERT INTO product VALUES ('K9-BD-01', '03', '牛头犬', '来自英格兰的友好的狗', 1350.00, 1500.00, 5);
INSERT INTO product VALUES ('K9-CW-01', '03', '吉娃娃犬', '很好的陪伴狗', 180.00, 200.00, 120);
INSERT INTO product VALUES ('K9-DL-01', '03', '斑点狗', '来自消防队的大狗', 3000.00, 3000.00, 1);
INSERT INTO product VALUES ('K9-PO-02', '03', '狮子犬', '来自法国的可爱的狗', 2000.00, 2000.00, 3);
INSERT INTO product VALUES ('K9-RT-01', '03', '金毛猎犬', '大家庭的狗', 300.00, 300.00, 200);
INSERT INTO product VALUES ('K9-RT-02', '03', '拉布拉多猎犬', '大猎狗', 800.00, 800.00, 30);
INSERT INTO product VALUES ('RP-LI-02', '05', '鬣蜥', '友好的绿色朋友', 60.00, 78.00, 40);
INSERT INTO product VALUES ('RP-SN-01', '05', '玉米锦蛇', '兼当看门狗', 200.00, 240.00, 10);

/*4*/
INSERT INTO orders VALUES (20130411, 'u0001', '2013-04-11 15:07:34', 500.00,0);
INSERT INTO orders VALUES (20130412, 'u0002', '2013-04-09 15:08:11', 305.60,0);
INSERT INTO orders VALUES (20130413, 'u0003', '2013-04-15 15:09:00', 212.40,0);
INSERT INTO orders VALUES (20130414, 'u0003', '2013-04-16 15:09:30', 120.45,1);
INSERT INTO orders VALUES (20130415, 'u0004', '2013-04-02 15:10:05', 120.30,0);

/*5*/
INSERT INTO lineitem VALUES (20130411, 'FI-SW-01', 10, 18.50);
INSERT INTO lineitem VALUES (20130411, 'FI-SW-02', 12, 16.50);
INSERT INTO lineitem VALUES (20130412, 'K9-BD-01', 2, 120.00);
INSERT INTO lineitem VALUES (20130412, 'K9-PO-02', 1, 220.00);
INSERT INTO lineitem VALUES (20130413, 'K9-DL-01', 1, 130.00);
INSERT INTO lineitem VALUES (20130414, 'RP-SN-01', 2, 125.00);
INSERT INTO lineitem VALUES (20130415, 'AV-SB-02', 2, 50.00);
/*4.4.3  Petstore数据修改与删除操作*/
/*1*/
/*(1)*/
UPDATE product 
SET unitcost=(qty*unitcost+50*15)/(qty+50) 
WHERE name='天使鱼';
UPDATE product 
SET listprice = unitcost *1.2,qty=qty+50 
WHERE name='天使鱼';
UPDATE product 
SET unitcost =(qty* unitcost +50*15)/(qty+50), 
listprice = unitcost *1.2,qty=qty+50 
WHERE name='天使鱼';

/*(2)*/
UPDATE orders 
    SET status=1 
    WHERE orderid= '20130411';
UPDATE lineitem,product  
    SET product.qty= product.qty-lineitem.quantity 
    WHERE lineitem.itemid= product.productid
        AND lineitem.orderid='20130411';
UPDATE orders,lineitem,product  
    SET orders.status=1, 
        product.qty= product.qty-lineitem.quantity 
    WHERE orders.orderid=lineitem.orderid
        AND lineitem.itemid= product.productid 
        AND orders.orderid='20130411';

/*2*/
/*(1)*/
DELETE  FROM account  WHERE userid='u0004';
/*(2)*/
DELETE orders,lineitem 
    FROM orders,lineitem
    WHERE orders.orderid=lineitem.orderid 
        AND orders.userid='u0004';
DELETE account,orders,lineitem
    FROM account,orders,lineitem
    WHERE account.userid=orders.userid
        AND orders.orderid=lineitem.orderid 
        AND account.userid='u0004';
/*第五章*/
/*5.4.1  SELECT语句的基本使用*/
/*1.*/
SELECT fullname AS 姓名, address AS 地址, phone AS 电话 FROM account;
/*2.*/
SELECT DISTINCT itemid, unitprice FROM lineitem;
/*3.*/
SELECT orderid, itemid, quantity * unitprice AS 金额 FROM lineitem;
/*4.*/
SELECT fullname, 
    CASE WHEN sex = '男' THEN '1'
        WHEN sex = '女' THEN '0'
    END AS sex
FROM account;
/*5.*/
SELECT  name, 
    CASE
        WHEN unitcost < 1000 THEN  '低价商品'
    WHEN unitcost >=1000 and unitcost<2000 THEN '中档商品'
        ELSE '高档商品'
    END  AS 档次
FROM  product;
/*5.4.2  条件查询*/
/*1*/
SELECT userid,totalprice, status FROM orders WHERE totalprice>=200;
/*2*/
SELECT * FROM orders 
    WHERE orderdate >= '2020-04-01' AND orderdate <= '2020-04-30';

/*3*/
SELECT fullname AS 姓名, address AS 地址, phone AS 电话 
    FROM account WHERE  sex='女';

/*4*/
SELECT * FROM account WHERE fullname like '吴%';
/*5*/
SELECT * FROM orders WHERE totalprice>=200 and totalprice<=500;
/*6*/
SELECT * FROM product WHERE productid like '%W___';


/*5.4.3  多表查询*/
/*1*/
SELECT orderid,name ,quantity FROM  lineitem
    JOIN product ON(itemid=productid); 

/*2*/
SELECT fullname,totalprice FROM orders 
    JOIN account  ON (orders.userid=account.userid)
        WHERE totalprice>=300;

/*3*/
SELECT * FROM orders JOIN account 
    ON (orders.userid=account.userid) 
        WHERE fullname='刘晓和';

/*4*/
SELECT fullname,totalprice FROM orders
    JOIN account ON (orders.userid=account.userid) 
        WHERE orderdate<='2020-05-01' and sex='女';
/*5*/
SELECT orderid, userid, orderdate FROM orders
 WHERE orderid IN
           ( SELECT orderid FROM lineitem WHERE itemid = 'FI-SW-02' );

/*6*/
SELECT * FROM product WHERE unitcost >=ANY 
    ( SELECT unitcost	FROM product WHERE name ='波斯猫' );


/*5.4.4  分类汇总与排序*/
/*1*/
SELECT COUNT( * ) AS 总人数 FROM account;
/*2*/
SELECT AVG( totalprice ) AS 每单平均价 FROM orders;
/*3*/
SELECT SUM(totalprice) as 成交总额 FROM orders;
/*4*/
SELECT MAX( totalprice ) AS 最高成交额, 
    MIN( totalprice ) AS 最低成交额
        FROM orders; 

/*5*/
SELECT MAX( totalprice ) AS 最高成交额, 
    MIN( totalprice ) AS 最低成交额
        FROM orders; 

/*6*/
SELECT catid,SUM(qty),AVG(unitcost) FROM product GROUP BY catid;
/*7*/
SELECT * FROM account ORDER BY phone DESC;
/*8*/
SELECT * FROM orders ORDER BY userid ,orderdate DESC;
/*9*/
SELECT itemid, sum( quantity ) FROM lineitem
    GROUP BY itemid 
        HAVING sum( quantity ) >=2
            ORDER BY sum( quantity );
/*第六章*/

/*1.*/
CREATE VIEW account_v1 
AS 
        (SELECT userid AS 客户编号, fullname AS 姓名, 
                password AS 密码,sex AS 性别,phone AS 电话
        FROM account where sex='男' )
            WITH CHECK OPTION;
/*2.*/
SELECT * FROM account_v1 WHERE 姓名 LIKE '张%'; 
/*3.*/
CREATE VIEW orders_v2
AS 
    (SELECT orderid,fullname,address,orderdate,totalprice 
    FROM orders JOIN account
        ON (orders.userid=account.userid) );

/*4.*/
SELECT * FROM orders_v2 WHERE year(orderdate )=2020;
/*5.*/
CREATE VIEW lineitem_v3
AS
    (SELECT name,orderdate,quantity,unitprice 
    FROM lineitem
        JOIN orders ON (lineitem.orderid=orders.orderid)
        JOIN product ON (lineitem.itemid=product.productid) ) ;

/*6.*/
INSERT INTO account_v1
    VALUES ('u0007', '张华', '123456', '男', '13901234567');

/*7.*/
UPDATE orders_v2 SET totalprice = totalprice+200 
    WHERE orderid =20130411; 

/*8.*/
DELETE FROM account_v1 WHERE 客户编号='u0002';
/*9.*/
DROP VIEW orders_v2,lineitem_v3;

/*第7章*/
/*1*/
/*(1)*/
CREATE INDEX  I_em_ind ON account(email DESC);
CREATE INDEX C_fa_ind ON account(fullname,address);
CREATE UNIQUE INDEX  U_na_ind ON product(name(4));
/*(2)*/
ALTER TABLE category
    ADD PRIMARY KEY(catid),
    ADD UNIQUE U_ca_ind(catname);
ALTER TABLE lineitem
    ADD PRIMARY KEY(orderid,itemid),
    ADD INDEX C_qu_ind(quantity,unitprice);
ALTER TABLE account
    ADD PRIMARY KEY(userid),
    ADD UNIQUE U_fu_ind(fullname)
/*(3)*/
CREATE TABLE shopcat(
    shopcatid int(11) NOT NULL PRIMARY KEY ,
    userid char(10) NOT NULL,
    itemid char(10) NOT NULL,
    quantity int(11) NOT NULL,
    unitprice decimal(10,2) NOT NULL,
    INDEX C_up_ind( userid,itemid )
);
/*2*/

SHOW INDEX FROM shopcat;
/*3*/

DROP INDEX C_up_ind ON shopcat;
/*4*/
alter table order partition by Key() partitions 3;
/*第8章*/
/*1*/
/*(1)*/
 DELIMITER $$
CREATE PROCEDURE cp(in id1 int,in id2 int,out bj int)
BEGIN
    DECLARE tp1,tp2 decimal(10,2);
    SELECT totalprice into tp1 FROM orders WHERE orderid=id1;
    SELECT totalprice into tp2 FROM orders WHERE orderid=id2;
    IF tp1>id2 THEN set bj=0;
    ELSE
        SET bj=1;
    END IF;
END $$
DELIMITER ;
/*(2)*/
CALL cp('20130411',' 20130414',@bj);
SELECT @bj;

/*2*/
/*(1)*/
CREATE FUNCTION SP_NUM()
    RETURNS Integer 
DETERMINISTIC
RETURN ( SELECT count( * ) FROM product);
/*(2)*/
SELECT SP_NUM( );
/*3*/
/*(1)*/
DELIMITER $$
CREATE FUNCTION JG_CP (spn varchar(30))
    RETURNS char(10) 
DETERMINISTIC
BEGIN
    DECLARE lp,up decimal(10,2);
    SELECT listprice,unitcost INTO  lp,up FROM product WHERE name =spn;
    IF lp=up THEN RETURN 'YES';
    ELSE 
        RETURN 'NO';
    END IF;
END $$ 
DELIMITER ;
/*(2)*/

SELECT JG_CP('燕雀'),JG_CP('狮子犬'),JG_CP('响尾蛇');
/*4*/
/*(1)*/
DELIMITER $$
CREATE TRIGGER usr_del AFTER DELETE
    ON account FOR EACH ROW
BEGIN
    DELETE FROM orders WHERE userid=OLD.userid;
END $$
DELIMITER ;

/*(2)*/
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM account WHERE userid='u0002';

/*5*/
/*(1)*/
DELIMITER $$
CREATE TRIGGER ord_upd  AFTER INSERT
    ON lineitem FOR EACH ROW
BEGIN
    DECLARE tp decimal(10,2);
    DECLARE id int(11) ; 
    SELECT quantity*unitprice INTO tp FROM lineitem 
        WHERE orderid=NEW.orderid and itemid=NEW. itemid;
    SELECT orderid INTO id FROM orders WHERE orderid=NEW.orderid;
IF id>0 THEN
    UPDATE orders SET totalprice=totalprice+tp WHERE orderid=NEW.orderid;
END IF;
END $$
DELIMITER ;

/*(2)*/
INSERT INTO lineitem ( orderid ,itemid ,quantity ,unitprice)
    VALUES ( 20130414, 'FL-DSH-01', 2, 80);

/*6*/
/*(1)*/
DELIMITER $$
CREATE TRIGGER item_upd  AFTER UPDATE
    ON product FOR EACH ROW
BEGIN
    DECLARE lp decimal(10,2);
SELECT listprice INTO lp FROM product 
WHERE productid=OLD.productid ;
UPDATE lineitem SET unitprice =lp WHERE itemid= OLD.productid;
END $$
DELIMITER ;

/*(2)*/
UPDATE product SET listprice= 250.00 WHERE productid= 'K9-DL-01';
/*7*/
/*(1)*/

CREATE EVENT event_update ON SCHEDULE EVERY 1 MINUTE
STARTS CURDATE() + INTERVAL 1 MINUTE
DO
UPDATE product set qty=qty+1 where name= '金鱼';
/*第九章*/
/*1*/
/*(1)*/
CREATE USER
    a0001@localhost IDENTIFIED BY '123456', 
    s0001@localhost IDENTIFIED BY '123456',
    u0001@localhost IDENTIFIED BY '123456';
/*(2)*/
SET PASSWORD FOR a0001@localhost = 'admin123';
/*2*/
/*(1)*/
USE petstore;
GRANT SELECT ON product  TO u0001@localhost;

/*(2)*/
USE petstore;
GRANT UPDATE(fullname, address) ON account TO u0001@localhost;

/*(3)*/
GRANT  ALL  ON  *.*  TO  a0001@localhost;
/*(4)*/
GRANT  SELECT  ON  petstore.*  TO  s0001@localhost
    WITH GRANT OPTION;

/*(5)*/
REVOKE  UPDATE  ON  petstore.account   FROM  u0001@localhost;

/*8*/
SELECT * FROM orders INTO OUTFILE 'D:/orders.txt'
    FIELDS  TERMINATED BY ','	OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '?';

/*3*/
/*(1)*/
SELECT * FROM orders INTO OUTFILE 'D:/orders.txt'
    FIELDS  TERMINATED BY ','	OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '?';

/*(2)*/
CREATE TABLE bk_orders LIKE orders ;
LOAD DATA INFILE  'D:/orders.txt'	INTO TABLE  bk_orders
    FIELDS  TERMINATED BY ','  OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '?';
