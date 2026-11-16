/* 创建数据库  */
CREATE DATABASE DuDaInfo DEFAULT CHARACTER SET utf8;

/* 指定默认数据库  */
USE DuDaInfo;


/* 创建表  */
CREATE TABLE product( 
 id mediumint unsigned NOT NULL AUTO_INCREMENT, 
 name varchar(150) NOT NULL, 
 cat_id smallint NOT NULL DEFAULT 0, 
 size varchar(20), 
 price decimal(10,2) unsigned NOT NULL DEFAULT 0.00, 
 image varchar(100) , 
 content longtext, 
 keywords varchar(255), 
 add_time date, 
 sort tinyint unsigned NOT NULL DEFAULT 0, 
 PRIMARY KEY (id) 
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


/* 查看表结构  */
desc product;


/* 表中插入记录  */
INSERT INTO product VALUES 
 (1, 'PC008-1 BENZ.with diode', 1, '93mm', 2000.00, 'images/pro-1.jpg', 
'PC008-1 BENZ.with diode', 'PC008-1 BENZ.with diode', '2022-10-11', 10), 
 (2, 'PC008-3A', 1, '101mm', 599.00, 'images/pro-2.jpg', 'PC008-3A', 
'PC008-3A', '2022-10-15', 10), 
 (3, 'PC009-6 with diode', 2, '94mm', 1399.00, 'images/pro-3.jpg', 'PC009-6 
with diode', 'PC009-6 with diode', '2022-11-15', 10), 
 (4, 'PC009-3ZZ', 2, '101mm', 999.00, 'images/pro-4.jpg', 'PC009-3ZZ', 
'PC009-3ZZ', '2022-12-31', 10);
