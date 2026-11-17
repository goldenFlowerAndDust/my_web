-- 一、列查询

-- 1. distinct 消除重复行
select DISTINCT 书号,`库存状态` from `库存表`;

-- 2. as 替换字段名,可以省略

select `姓名` as name , 单位 college from `读者表`;

-- 3. ROUND(数字, 小数位数)
/*
  数字：要处理的数值（可以是字段、表达式或常量）

  小数位数（可选）：

    指定正数（如 2）→ 四舍五入保留 n 位小数

    省略或为 0 → 四舍五入取整

    指定负数（如 -1）→ 四舍五入到十位、百位等
*/

select `书名`, ROUND(数量*`单价`) 金额 from `图书表`;

-- 4. 语法: case when 条件 then 当符合条件时，返回值的值
/*
  CASE 是 MySQL 中的条件表达式，类似于编程语言中的: 
  if-else if-else，根据不同条件返回不同结果。它必须从 CASE 开始，以 END 结束。
  语法形式:
    1.
    CASE 
    WHEN 条件1 THEN 结果1
    WHEN 条件2 THEN 结果2
    ...
    ELSE 默认结果
    END
    ····依次判断 WHEN 后的条件，第一个满足的条件返回对应的 THEN 结果
    ····如果都不满足，返回 ELSE 后的值（ELSE 可省略，省略时返回 NULL）
    2.
    CASE 表达式
    WHEN 值1 THEN 结果1
    WHEN 值2 THEN 结果2
    ...
    ELSE 默认结果
    END
    ···先计算 表达式 的值，然后与 WHEN 后的值逐一比较，相等则返回对应的 THEN 结果
*/

SELECT 条码,

CASE 
	WHEN `库存状态` = '在馆' THEN 1  -- 当库存状态为在馆，则返回数字1
	WHEN `库存状态` = '借出' THEN 0  -- 当库存状态为借出，则返回数字0
	WHEN `库存状态` = '丢失' THEN -1 -- 当库存状态为丢失，则返回数字-1
END `库存状态` -- 将字段名 更名 为 库存状态
FROM `库存表`; -- 引用表格

-- 二、条件查询

-- 1. select(查询关键字) 字段(必须在表前决定可以通过as改名,as可以省略) from(引用表格关键字) 表名 where(条件关键字) 条件表达式
select `书名`,`数量`,`出版社` from `图书表` where 数量>10;

-- 2. 查询含有A的字符   当查询的条件没有具体字段,使用[*]可以查询到符合条件的所有字敦
/*
  模糊查询(重点)关键字Like:
    1.模糊查询用于匹配不完整、不确定的信息，核心是 LIKE 关键字配合通配符。
    2.语法:SELECT 字段 FROM 表名 WHERE 列名 LIKE '带通配符的字符串';
  通配符	含义	                          示例

  %	      代表任意多个字符（包括 0 个）	  '张%' → 以“张”开头的任意内容
  _	      代表1个任意字符	              '张_' → “张” + 恰好 1 个字符（如“张三”）
  
  注意事项:
    大小写敏感问题：
        默认情况下，MySQL 的 LIKE 对英文字母不区分大小写，所以 %A% 也会匹配包含 a 的记录
        如果需要区分大小写，可以加 BINARY 关键字：WHERE BINARY 书名 LIKE '%A%'（只匹配大写 A）
    中文环境：%A% 只匹配英文字母 A，不会匹配中文“啊”等
    性能：%A% 因为通配符在开头，无法使用索引，大数据量时查询较慢
*/
select * from `库存表` where `位置` LIKE '%A%' and  `库存状态` = '借出';

-- 3. BETWEEN ... AND ...（针对范围条件） 优先级: () > and > or
select * from `图书表` where `类别` = ('财金' or `类别` = '文学') and `数量` > 5;

-- 4. 
/*  判断为空:
      WHERE 字段名 IS NULL
    判断不为空:
      WHERE 字段名 IS not NULL
*/
select * from `借阅表` where `还书日期` is NULL;

-- 三、多表查询

-- 1.
/*
  多表查询：
    1.先查找两个或多个表相同字段
    2.当有多个表，先看联系，再连接
    3.查询方式有两种：
        1.通过 where 的方式，将两个或多个表相同字段，通过=连接(非常不推荐)
        2.通过 join方式：
            第一种情况(ON关键字)： select 字段 from 表1 join 表2 on 表1.相同字段 = 表2.相同字段 join .....
            第二种情况(using关键字) ：select 字段 from 表1 join 表2 using(相同字段) join 表3 using(相同字段)...
        推荐采用join using 的方法：              
    特性	        USING（受限）	              ON（自由）
  连接条件	  强制要求同名字段	          可以写任意表达式
  潜在风险	  低——不会写出无意义的连接	  高——可能写出 ON 1=1 或字段类型不匹配的“瞎连”
  代码可读性	一眼看出连接依据	          需要仔细看条件才能理解
  结果列	    自动去重，清爽	            可能产生重复列名，需手动处理
  团队协作	  强制命名规范，代码风格统一	每个人可能写不同样式的条件
  
  注意：当多个表之间不是全部字段统一，可以先试着找关系，逐个join using
*/
select * from `读者表` join `借阅表` using(`读者编号`) where `读者表`.`姓名`='张小东';
select * from `读者表` join `借阅表` on `读者表`.`读者编号` = `借阅表`.`读者编号` where `读者表`.`姓名` = '张小东';
select * from `读者表`,`借阅表` where `读者表`.`读者编号`=`借阅表`.`读者编号` and `读者表`.`姓名` = '张小东';

-- 2.

select 书号,`条码` from `借阅表` join `库存表` using(条码) join `图书表` using(书号) where `借阅表`.`借阅状态` = '借阅';

-- 3.

select `姓名`,单位,`可借天数`,`可借数量` from `读者表` join `读者类型表` using(类别号);

-- 4.
select 姓名,书名,借阅日期,借阅状态 from `读者表` join `借阅表` using(`读者编号`) join `库存表` using(条码) join `图书表` using(书号);

-- 5. 外连接:外连接是 SQL 中用于保留不匹配行的连接方式。当两个表连接时，如果某行在另一个表中没有对应的匹配行，内连接（INNER JOIN）会丢弃该行，而外连接会保留它，缺失的字段用 NULL 填充。
/*

  左外连接	LEFT JOIN 或 LEFT OUTER JOIN	左表全部行 + 右表匹配行
  右外连接	RIGHT JOIN 或 RIGHT OUTER JOIN	右表全部行 + 左表匹配行
  
  左连接：左表全部保留。右表有匹配 → 正常显示；右表无匹配 → 右表字段全为 NULL。
  右连接：右表全部保留。左表有匹配 → 正常显示；左表无匹配 → 左表字段全为 NULL。
  内连接：不保留任何无匹配的行，因此永远不会出现 NULL（除非数据本身是 NULL）。
  
  想让哪个表的字段在没匹配时显示为 NULL，就把那个表放在外连接的“反方向”。
*/

select 书名,条码,位置,`借阅表`.`读者编号` from `图书表` join `库存表` using(书号) left join `借阅表` using(条码);


-- 四、分类汇总

-- 1. group by hving(分组后使用) where(分组前使用)
select 单位,count(*) 人数 from `读者表` group by 单位;

-- 2.
select 单位,count(*) 读者人数 from `读者表` group by 单位 having count(*) >=2;

-- 3.
select 出版社,AVG(单价) as 平均单价 , ROUND(SUM(单价*数量)) as 总金额 from `图书表` GROUP BY 出版社;

-- 4. with rollup 小计

select 读者编号,条码,COUNT(*) as 借阅次数 from `借阅表` GROUP BY  读者编号,条码 with rollup;

/*
  二、常用聚合函数
函数	                      作用	                              示例
COUNT(*)	              统计组内行数（含 NULL）	          每种图书的库存数量
COUNT(列名)	            统计该列非 NULL 值的个数	        有联系电话的会员数
SUM(列名)	              求和	                            每种图书的总订购册数
AVG(列名)	              平均值	                          各类图书的平均单价
MAX(列名)	              最大值	                          最晚的注册时间
MIN(列名)	              最小值	                          最早的出版年份
*/

-- 5. 排序 order by   降序 desc 升序 asc

select * from `图书表` ORDER BY 数量 desc;

--  6.

select * from `借阅表` ORDER BY `借阅状态`,`借阅日期` asc;

-- 7.
SELECT 读者类型表.`类名` AS 类别,读者表.单位,COUNT(*) AS 借阅次数 FROM 借阅表 JOIN 读者表 using(读者编号) JOIN 读者类型表 using(类别号) GROUP BY 读者类型表.类名, 读者表.单位 ORDER BY 借阅次数 DESC;