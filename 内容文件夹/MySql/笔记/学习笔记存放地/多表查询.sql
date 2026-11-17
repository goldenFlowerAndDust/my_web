-- 多表查询 ：
/*
	指定数据库的两种方法：
	
	1.select* from 数据库.表名 (单次指定)
	2.use 数据库 (后续均用此数据库)
*/

use mysqll;

SELECT * from mysqll.book;

/*
	表名取别名：
		select 表名 as 新表名;
		as可以省略
		
		注意：该名后，后续的表名用新表名
	
*/


/*
	多表查询：
	语法: select 需要查找字段名(英文逗号隔开) from 所有字段所在的表名(多个表，英文逗号隔开) where【条件是多个表内字段相等】

*/

select 书名,订购册数,订购时间 from book,sell
where book.`图书编号` = sell.`图书编号`;

-- 查找购买mysql数据库且订购数量大于5的图书信息

select book.* from book,sell 
WHERE book.`图书编号` = sell.`图书编号`
and book.`书名` = 'MYSQL数据库' AND sell.`订购册数` > 5;

-- 查询订购数量大于5本图书的会员姓名和订购册数

select 姓名 as '会员姓名',订购册数 from members,sell
where members.`用户号` = sell.`用户号` and sell.`订购册数` > 5;

-- 查询购买"网页程序设计" 且订购数量大于5本图书和会员姓名和订购册数

select 图书，姓名 as 会员姓名，订购册数 from book,members,sell
where book.`图书编号` = sell.`图书编号` and sell.`用户号` = members.`用户号`
and book.`书名` = '网页程序设计' and sell.`订购册数` > 5;


/*
	join 使用方法 ： 
					select 字段名 from 表1 join 表2 on 表1和表2相同字段(形式：表1.字段名 = 表2.字段名) join 表3 表3和表2相同字段 ....... where 条件  不使用using，字段名需要选定具体的表
					select 字段名 from 表1 join 表2 using(表1和表2相同字段名) join 表3 using(表2和表3字段名) ...... where 条件   使用using，字段名不需要选定具体的表
 
*/

