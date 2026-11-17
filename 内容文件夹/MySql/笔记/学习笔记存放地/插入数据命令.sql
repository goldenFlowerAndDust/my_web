use goldenfloweranddust;

-- 插入数据：insert into 表名(字段列表) values(值列表)

insert ignore into book(图书编号,图书类别,书名,作者,出版社,出版时间,单价) values('1','2','3','4','5','2026/4/16',35);

/*
			插入重复的主键值报错:
										  1. insert  ignore(跳过) INTO
											2. replace(替换) into 


*/

/*
		插入数据第二种方法 ： insert into 表名(字段列表)  set 字段1 = 对应值1， 字段2 = 对应值2.... 
		注意：
			1. 不为空。必须有值。没有值看默认值，没有默认值报错
			2. 值一定与列一一对应。

*/


--  若全部列插入数据，则可省略列名，值顺序一定和原表列顺序一样

--  可以一次插入多条数据。最好换行，逗号隔开

/*
		修改数据 ： update 表名 set 列名 = 表达式 .....  where 条件
								注意： 不加where ，则修改全部行
*/
update book set 数量 = 100;
update book set 数量 = 10 where 单价 < 30;

--  将计算机类的图书数量增加10 ， 折扣为0.9

UPDATE book set 数量 = 数量+10 , 折扣 = 0.9 where 图书类别 = '计算机';

--  删除 : delete  from 表名 where 条件 。若不添加where ，则删除全部行
--  清楚表数据 truncate table 表名

