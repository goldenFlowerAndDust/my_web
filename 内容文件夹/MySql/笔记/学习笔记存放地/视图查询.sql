--  创建视图 语法：create [or replace] 视图名 [列名列表] as select 语句 视图列名高于表字段列名
create view jsj_sell AS
select 订单号,book.`图书编号`,书名,订购册数 from book join sell using(图书编号) where 图书类别 = '计算机';

-- 
create or replace view sale_AVG(name,sale_avg) AS
select 书名,avg(订购册数) from jsj_sell GROUP BY 书名;

-- 
select 订单号,订购册数 from jsj_sell;

-- 可更新视图 jsj_sell 不可插入、删除、不能同时修改

-- insert into 视图名 values(值......) 
create or replace jsj_book as select * from book where 图书类别 = '计算机' with check option;
insert into jsj_book values()

--  修改视图
alter view jsj_book as alter 