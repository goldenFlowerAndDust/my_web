-- 查询：
-- 1. select 字段列表 from 表名 where 条件

/*
	1.导入数据库实例：bookstore
	任务一：查询bookstore数据库的mebers表中各会员的会员姓名、联系电话和注册时间
	
	任务二.：查找全部列用*
	
	任务三：查询book表中类别为计算机的图书名、作者名和出版社，结果中各列的标题分别制定为name、auther、publisher
	
	任务四： 查询book表中图书编号、书名、数量，对其库存数量按一下规则进行替换：
	1.若数量为空值，替换为“尚未进货”；
	2.数量小于5，替换为“需进货”
	3.数量5~50之间，替换为“库存正常”
	4.若总学分大于50，“替换为库存积压”
	5.列标题更改为“库存”
	
	任务五：对sell表已发货的记录计算订购金额(订购金额=订购册数*订购单价)。并显示图书编号和订购金额
	
	任务六：对book表只选择图书类别和出版社，消除结果集中地重复行。DISTINCT

*/

-- 任务1

select 姓名,联系电话,注册时间 from members;

-- 任务2

select * from book;

-- 任务三： 用as取别名，as可以省略，若别名有空格用''

select 书名 as name,作者 'name of auther',出版社 publisher from book where 图书类别 = '计算机';

-- 任务四：注意：null不是固定具体数值，不用=，用is

select 图书编号,`书名`,
case

when 数量 is null then '尚未进货'
when 数量<5 then '需进货'
when 数量>=5 and 数量<=50 then '库存正常'

else '库存积压'

end 库存
from book;

-- 任务五：
select `图书编号` ,ROUND(`订购册数`*`订购单价`,1) 订购金额 from sell where 是否发货 = '已发货';

-- 任务六：
select distinct 图书类别,出版社 from book;
select distinct 出版社 from book;

-- 任务七：查询bookstore 数据库book表中书名为"网页程序设计"的记录

select * from book where 书名 = '网页程序设计';

-- 查询book表中单价大于30的图书书名，出版社和单价

select 书名,出版社,`单价` from book where 单价>30;

/*
	运算符: =、>=、<=、>、<、<=>、<>（不等于）、!=
	between......and.....在某范围(包括边界)
	逻辑运算符: and(&&)  OR(||)  not(!)  XOR(异或) 
	其中，and优先级高于or  可以添加括号
*/
