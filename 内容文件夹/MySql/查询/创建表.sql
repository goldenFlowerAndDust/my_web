use `回顾数据库`;

-- 创建表
create table if not exists `students` (
                                          `学号` int(11) not null primary key,
                                          `姓名` char(5) not null,
                                          `性别` char(2) not null,

                                          check(`性别` in ('男','女'))
);

-- 填入信息
insert ignore into `students`(学号,姓名,性别) value (2026106128,'张三','男');
insert ignore into `students`(学号,姓名,性别) value (2026106129,'李四','女');
insert ignore into `students`(学号,姓名,性别) value (2026106130,'王五','男');