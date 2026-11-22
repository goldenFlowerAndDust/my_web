-- ============================================================
-- 初始化脚本：建库 + 建表 + 插入示例数据
-- 执行方式（任选）：
--   1) Navicat 里打开本文件，全选运行
--   2) 命令行：mysql -u root -p < sql/init.sql
-- 注意：开头会先删库，重复执行不会报错
-- ============================================================

DROP DATABASE IF EXISTS student_app;
CREATE DATABASE student_app DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE student_app;

CREATE TABLE students
(
    id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    sno        VARCHAR(20)      NOT NULL UNIQUE COMMENT '学号，唯一',
    name       VARCHAR(50)      NOT NULL COMMENT '姓名',
    gender     ENUM ('男','女') NOT NULL DEFAULT '男' COMMENT '性别',
    age        TINYINT UNSIGNED NULL COMMENT '年龄',
    class_name VARCHAR(50)      NULL COMMENT '班级',
    created_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT = '学生表';

INSERT INTO students (sno, name, gender, age, class_name)
VALUES ('2026001', '张三', '男', 19, '计算机1班'),
       ('2026002', '李四', '女', 20, '计算机1班'),
       ('2026003', '王五', '男', 19, '计算机2班'),
       ('2026004', '赵六', '女', 20, '计算机2班'),
       ('2026005', '孙七', '男', 21, '软件1班'),
       ('2026006', '周八', '女', 19, '软件1班'),
       ('2026007', '吴九', '男', 20, '网络1班'),
       ('2026008', '郑十', '女', 21, '网络1班');

SELECT COUNT(*) AS 学生总数
FROM students;
