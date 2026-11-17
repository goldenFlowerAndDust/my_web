-- 回顾创建表

create table if not exists `students` (
  `学号` char(6) not null  PRIMARY KEY;
  `姓名` char(1) not null;
  `班级` char(10) not null;
)