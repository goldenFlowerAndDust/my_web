-- 数据库：bookstorm

--  1. group by 分组字段列表

--  按图书类别统计Book表中各类图书的库存数

select 图书类别,sum(数量) from book group by 图书类别;

-- 按出版社统计各出版社的图书的库存数，平均单价

select `出版社`,sum(数量),avg(单价) from book group by 出版社;

-- 2.按图书编号分类统计其订单和订单数的平均订购册数

select 图书编号,count(*),avg(订购册数) from sell group by 图书编号;

-- 按图书类别、出版社分类统计Book表中各类图书的库存数

select 图书类别,出版社,sum(数量) from book group by 图书类别,出版社; -- 后面可以是多个字段

-- 2.with ROLLUP

select 图书类别,`出版社`,sum(数量) from book group by 图书类别,出版社 with rollup;

-- group by 后用having 条件，显示分组后的结果  

-- where 是在分组前筛选  having 分组后筛选

-- 3.查找sell表中平均订购册数在5本以上的用户号和平均订购册数
select 用户号,avg(订购册数) from sell group by 用户号 having avg(订购册数)>5;

-- 查找sell表中已经发货平均册数在5本以上的用户号和平均册数
select 用户号,avg(订购册数) from sell where 是否发货 = '已发货' group by 用户号 having avg(订购册数) > 5;

-- 查找sell表中会员订单数在2笔以上且每笔订购册数都在5本以上的会员
select 用户号,count(*) from sell where 订购册数 >5 group by 用户号 having count(*) >=2;


-- order by 排序字段列表, asc默认升序  , desc降序
select 出版社,单价  from book;
select 出版社,单价 from book order by 单价 desc;
select 出版社,单价from book order by 7 desc;
select 出版社,单价 from book 出版社,7 order by desc;

--  utf8mb4  unicode编码排 ,拼音 GBK

-- limit 显示的行数
select * from book order by 单价 desc limit 3;

-- 偏移量从0，limit 2，2表示显示第三行开始后2条

select * from book order by 单价 desc limit 2,2; 


