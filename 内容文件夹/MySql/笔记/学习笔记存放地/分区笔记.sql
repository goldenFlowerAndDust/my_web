/*
	分区：数据类型必须是整型，存在主键或唯一键则分区列从主键或唯一键取部分，若不存在，则任何列
*/ 
show plugins; -- 8.0之后自带原生功能，不绑定插件

-- range分区 取值范围 连续且不重叠
/*
	partition by range(表达式)：
	
	
*/

--  讲sell表的数据按订购时间进行分区，2020年前的放P1区，2021-2022年放P2分区，2022年以后的放P3分区。

alter table sell PARTITION by range (year(订购时间))
(
	PARTITION p1 values less than(2020),
	PARTITION p2 values less than(2022),
	PARTITION p3 values less than MAXVALUE
);

-- 查看该表所有分区
select * from information_schema.`PARTITIONS` where table_name = 'sell';

-- 查看分区P2 2021-2022
select * from sell partition(p2);

--  删除2021-2022
alter table sell drop partition p2;


-- 2.list 离散值
/*
	partition by list() ();
	
*/

-- 1代表结清，放入分区p1 0表示未结清 ，放入分区p2
alter table sell partition by list(是否结清)
(
	partition p1 values in(1),partition p2 in(0)
);


-- hash 分区 partition by [linear] hash() [partition n]
-- 对n求余，分区名是系统自动生成，不能指定，从p0,p1.......
-- n被分割成分区的数量，缺省为1
-- 讲sell表的数据按订单号进行hash分区，共分为3个分区
alter table sell partition by hash(订单号) partition 3;
select * from sell partition(p1);
select * from sell partition(p2);
select * from sell partition(p3);

--  key分区 列的md5值

-- 假设sell表中订单号为主键，字段为整数类型。将sell表的数据按订单号进行key分区，共分为3个分区。
alter table sell partition by key(订单号) partition 3;
-- 有主键(唯一键)可不指定，默认用主键(唯一键)
alter table sell partition by key() partition 3;

-- 移除分区 保留数据
alter table sell remove partitioning;

-- 删除分区 删除数据
alter table sell drop partition p2;

-- 增加分区
-- 对于免单的订单，"是否结清"字段中用2表示，需要增加一个分区p3，用于存放免单的订单
alter table sell add partition(partition p3 values in(2));

--  重新分区（合并分区） 连续分区才能合并

-- sell 表已经按"是否结清"列分为3个分区

alter table sell reorganize partition p2,p3 into (partition m values in(0,2))


-- 拆分区 into()

alter table sell reorganize into(
	partition p3 values less than(2024),
	partition p4 values less than MAXVALUE
);

-- hash/key增加分区 2表示要增加分区的个数
alter table sell add partition partition 2;

-- hash、key合并分区 2表示要删除分区的数目
alter table sell coalesce partition 1;