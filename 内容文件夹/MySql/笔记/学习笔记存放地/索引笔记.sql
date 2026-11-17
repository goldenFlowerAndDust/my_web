--  索引——是一种提高查找速度的

/*
	二分索引

*/

-- create 唯一索引/全文索引 index 索引名 on  表名(字段名 长度 asc/desc ,.....)


--  根据Book表的书名列上的去建立6个字符建立一个升序索引 name_book

create index name_book on book(书名(6));
explain select * from book where 书名 = 'abcd';

--  用户号和图书编号 建立一个复合索引sfz_bn_sell

create index sfz_bn_sell on sell(用户号,图书编号);


-- 假设Book表中主键设定，为book表创建以图书编号为主键索引,出版社,作者和出版时间为复合索引，以加速表的检索速度

alter table book
add PRIMARY key(图书编号),
add index (出版社,作者,出版时间);

-- 索引失效：
EXPLAIN select * from book where 出版社 = 'avde';
EXPLAIN select * from book where 作者 = 'avde';
EXPLAIN select * from book where 作者 = 'avde' and 出版社 = 'avde';
EXPLAIN select * from book where 出版时间 = '21-1-1' and 出版社 = 'avde';
EXPLAIN select * from book where 出版时间 = '21-1-1' and 出版社 = 'avde' 作者 = '11';

--  全直匹配
-- 最左前缀原则：不能跳过中间列
-- (带头大哥不能死，中间兄弟不能断)
-- 索引列不能计算

-- 创建表时创建索引
-- 删除索引: drop index 索引名 on 表名
-- 删除索引: alter table 表名 drop primary key , drop index 出版社;