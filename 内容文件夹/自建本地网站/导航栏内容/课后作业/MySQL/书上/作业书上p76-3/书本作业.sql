create table `读者表副本` AS SELECT * FROM `读者表`;
create table `读者类型表副本` AS SELECT * FROM `读者类型表`;
create table `借阅表副本` AS SELECT * FROM `借阅表`;
create table `库存表副本` AS SELECT * FROM `库存表`;
create table `图书表副本` AS SELECT * FROM `图书表`;


alter table `读者表副本` add PRIMARY key(读者编号);

alter table `读者类型表副本` add PRIMARY key(类别号);

alter table `读者表副本` add foreign key(类别号) REFERENCES `读者类型表副本`(类别号) on delete CASCADE on UPDATE CASCADE;

alter table `借阅表副本` add foreign key(读者编号) references `读者表副本`(读者编号);

alter table `库存表副本` add PRIMARY key(条码);

alter table `借阅表副本` add foreign key(条码) references `库存表副本`(条码) on delete cascade on update cascade;

alter table `读者类型表副本` add  check(可借天数 > 0 and 可借天数 < 30);