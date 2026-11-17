-- 子查询:使用另一个查询的结果作为查询条件的一部分

/*
	与mysql数据库同出版社的图书信息

	select 字段 from 表名 where 需要查询的字段 = (
		select `需要查询的字段` from  表名 where 
	)

*/
use book;
select 出版社 from book where 书名 = 'MYSQL数据库';
select * from book where 出版社='北京大学出版社';

-- 查询与MYSQL相同单价的图书编号和价格
select 图书编号,单价 as 价格 from book where 单价=(
	select `单价` from book where 书名 = 'MYSQL数据库' 
) and 书名<>'MYSQL数据库';
-- <>不等于
-- 查询与计算机类图书同出版社的图书信息
-- in 表示一个范围一个集合(当符合条件有多个)
select * from book where 出版社 in (
	select 出版社 from book where 图书类别 = '计算机'
) and 图书类别 <> '计算机';

-- 查询book表中所有比"网页设计"类图书价格都高的图书基本信息
--  all 去条件数最大的比较
select * from book where 单价 > all(
	select 单价 from book where 图书类别 = '网页设计'
);


-- 查询book表中所有比"网页设计"类图书价格都高的图书基本信息
-- some 去条件数最小的比较
select * from book where 单价 > some(
	select 单价 from book where 图书类别 = '网页设计'
);

-- 聚合函数

/*
	count 求个数
	MAX 最大值
	MIN 最小值
	SUN 表达式求和
	AVG 平均值
*/
-- 查询book表中所有比"网页设计"类图书价格都高的图书基本信息

select * from book where 单价 > (
	select min(单价) from book where 图书类别 = '网页设计'
) and 图书类别 <> '网页设计';

--  查询多少种图书
select count(distinct 图书类别) from book;

-- 查询sell表中订购册数不低于编号'TS.305'的任何一个订单的订购册数的订单信息

select * from sell where 订购册数>=some(
	select 订购册数 from sell where 图书编号 = 'TS.305'
);

-- 查找sell表中订购册数不低于编号为'TS.305'