/* 命令创建表 create table if not exists 表格名(
    字段  字符类型()——可多次建立  设置字段就是设置列。NOT NULL(是否为空)  
    PRIMARY KEY(是否这是为主键)——可以放在最后也可以放在主键字段后面
    
      注意事项：
            1.外层用小括号
            2.除最后一个字段以外末尾都要添加(英文逗号)
            3.外层最后用【英文分号】隔开
  
    关于数据类型(自查询MySQL数据类型)
)
*/

create table if not exists `第一次命令建表`(
  读者编号 char(6) NOT NULL PRIMARY KEY,
  姓名 char(10) not NULL,
  类别号 char(2) not NULL,
  单位 varchar(20) NULL,
  有效性 char(10) NULL
);

/*
    复制表结构：
            1.like：会复制主键、索引、自增属性、默认值、注释等所有表结构信息，但是数据为空
                1)语法：create table 新表名 LIKE 原表;
                2)使用场景：需要一张和原表结构相同但暂时不填充数据的空表
                
            2.as select : 复制列名和数据类型，不会复制[主键、索引、自增属性、默认值、注释等所有表结构信息]
                1)语法：create table 新表名 AS SELECT * FROM 原表;
                2)使用场景：需要一张包含数据的新表，但是约束要求不高
                
            3.相同部分：都会将字段复制
                

*/

create table `第一次建表副本_空表` LIKE `第一次命令建表`;
create table `第一次建表副本_AS` AS SELECT * FROM `第一次命令建表`;
create table `第一次建表副本_删除表素材` AS SELECT * FROM `第一次命令建表`;


/*
      删除表： 语法： drop table if exists 表名
  
*/
drop table if exists `第一次建表副本_删除表素材`;


/*
    显示数据库下全部表： 语法： show tables;
*/

show TABLES;

/*

    显示某张表的定义信息 ： 语法： show create table 表名

*/

show create table `第一次建表副本_空表`;

/*

    显示表各列信息： 语法： desc 表名

*/

desc `第一次命令建表`;

/*

  显示表某列信息： 语法： desc 表名 列名
  
*/

desc `第一次命令建表` 读者编号;


/*

  修改表——添加列
        1.默认加在后面      语法：alter table 表名 add 列名 int;
        2.First放在首位     语法：alter table 表名 add 列名 int first;
        3.after 放在某列后  语法：alter table 表名 add 列名 int after 字段名(就是需要添加列前面的列名);

*/


alter table `第一次命令建表` add 默认添加列 int;
alter table `第一次命令建表` add 添加位置在首位 int FIRST;
alter table `第一次命令建表` add 添加在_类别号_后面 int after 类别号;

/*

  修改表——默认值(指的是当记录为null时，默认显示[当设置为可以为null时，null的优先级最高])
      1.仅修改默认值，不该其他属性   语法： alter table 表名 alter column(MySQL可以省略) 列名 set default 默认值; ←——当只需要改默认值，用它最好   所谓默认值指的是当字段列内容是空的时候，显示的值。  当字段允许null,优先级是null
      2.重新定义列，同时修改默认值   语法： alter table 表名 modify column(MySQL可以省略) 列名 数据类型 (若设置非空或主键，需要一并写出来) default 默认值;
      3.默认值是字符串，所以用单引号('默认值')包裹。表名、列名都是名字，需要用单反引号包裹(`表名/列名`)

*/

alter table `第一次命令建表` alter column 姓名 set default '张三';
alter table `第一次命令建表` modify column  单位 varchar(15) not null default '职院';

/*

    修改表——字段重命名 ，数据类型不改也要加上原类型否则报错：
                                        1.语法：alter table 表名 change 列名 新列名 新数据类型  约束(not null....)  [FIRDT|AFTER某列]
                                        2.[FIRDT|AFTER某列]——指的是更改后放置哪一列，不填默认在原位
                                        3.数据类型【不改也要写上】

*/

alter table `第一次命令建表` change 有效性 有效性改名_并放置姓名后面  char(10) null after 姓名;

/*


    修改表——修改字段属性(数据类型、位置.....):
                      1.语法: alter table 表名 modify column 列名 数据类型(或约束.....)
                      2.语法: alter table 表名 列名 列名 数据类型(或约束.....)————因为change，所以一定要写两次列名

*/

alter table  `第一次命令建表` modify column 类别号 char(5) null ;
alter table `第一次命令建表` change `添加在_类别号_后面` `添加在_类别号_后面` char(10) null;


/*


      修改表——删除字段 ： 语法： alter table 表名 drop 列名

*/

alter table `第一次建表副本_空表` drop 有效性;

/*

    修改表——重命名表： 语法 ： alter table 表名 rename to 新表名

*/

alter table `第一次建表副本_空表` rename to `单次重命名表`;

/*

    修改表——重命名多次表： 语法： rename table 表1名 to 新表1名, 表2名 to 新表2名; .........【每重命名表，用英文逗号隔开】

*/


create table if not exists `表1`(
  `字段` char(5) not null primary KEY,
  `字段2` int(5) null
);

create table `表1_副本1` LIKE `表1`;

create table `表1_副本2` AS select * from `表1`;

rename table `表1` to `重命名多次表_实验表`, `表1_副本1` to `重命名多次表_实验表1`, `表1_副本2` to `重命名多次表_实验表2`;

