-- 创建表
create database if not exists new_student_app
    default charset = utf8mb4 collate = utf8mb4_unicode_ci;
/*数据库名称不要引号包裹，单引号包裹会报错，反引号 ` 包裹是合法的。准确说是“不要用单引号” |*/
-- 切换数据库
use new_student_app;
-- 建表，添加数据
create table if not exists students
( /*int unsigned————> 表示放弃负数（unsigned），将正数上限拔高（0或正数）*/
    id          int unsigned            not null auto_increment primary key
    /* auto_increment——自动生成递增的整数值（插入或创建行自动递增） primary key——设置主键-唯一性。*/,
    /* not null 非空 */
    students_id varchar(20)             not null unique,
    /* unique——唯一约束。————>重复值会报错*/ /*varchar()——可变存储，始终是按文本占位（外加 1~2 字节长度前缀（≤255 字节用 1 字节，>255 用 2 字节））。
        char()——定长存储，始终按定义的 n 占位，不足补空格
    */
    /* 关于：身份证、学号之类，尽量字符串存储 */
    name        varchar(15)             not null,
    gender      ENUM ('男','女','未知') not null default '未知',
    /* ENUM——固定选项，设置之后，输入非预设的值，会报错 */
    age         TINYINT unsigned        not null, /* TINYINT(占一字节数字，有符号范围：-128~127 ，无符号范围（unsigned）：0~255) */
    class_name  varchar(50)             null default 'null',
    created_at  DATETIME                not null default current_TIMESTAMP
    /*
        DATETIME——日期+时间存储数据类型，格式：YYYY-MM-DD HH:MM:SS。-翻译：年-月-日 时:分:秒，不受时区影响，填入的是什么，结果就是什么
        default —— 默认值，当值为空的时候，自动插入预设的值
        current_date ——获取插入数据后的日期，时间是当天零点，受到时区影响
        current_timestamp ——获取插入数据后的日期+时间，受到时区影响
    */
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_unicode_ci;

-- 写入数据
insert ignore into students(`students_id`, `name`, `gender`, `age`, `class_name`)
values ('20253101680', 'YLH', '男', 20, '软件技术三班'),
       ('20253101683', 'YJY', '男', 20, '软件技术三班'),
       ('20253101670', 'ZHB', '男', 100, '软件技术三班'),
       ('20253101671', 'ZZY', '男', 25, '软件技术三班'),
       ('20253101672', '张三', '男', 7, '物联网一班'),
       ('20253101671', '李四', '男', 25, '数控三班'),
       ('20253106671', '王五', '男', 5, '软件技术三班'),
       ('20253101671', '老六', '男', 25, '物联网一班'),
       ('20253101671', '老七', '男', 18, '软件技术三班'),
       ('20250101671', '老八', '男', 25, '数控三班'),
       ('20353101671', '老九', '男', 30, '软件技术三班'),
       ('20253101371', '老十', '男', 25, '物联网一班'),
       ('20253101671', '老十二', '男', 25, '数控三班'),
       ('20353101671', '老十三', '男', 10, '软件技术三班'),
       ('20353101671', '老十四', '男', 18, '物联网一班'),
       ('20253131671', '老十五', '男', 25, '软件技术三班');