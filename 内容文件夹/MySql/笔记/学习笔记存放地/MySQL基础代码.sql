/* 
  新建数据库：  
              方法一：【CREATE DATABASE 数据名】                    (相同数据库名会报错)
              方法二：【CREATE DATABASE if not EXIXTS 数据库名】    (相同数据库名不会报错)

*/
CREATE DATABASE if not EXISTS hellomysql;


/*
  查询所有数据库：【SHOW DATABASES】
*/

SHOW DATABASES;

/*
  指定数据库：【USE 数据库名】

*/

USE hellomysql;

/*
  查询当前数据库的数据：【SELECT DATABASE()】

*/

SELECT DATABASE();


/*
  删除数据库：
              方法一：【DROP DATABASE 数据库名】
              方法二：【DROP DATABASE if EXISTS 数据库名】

*/

DROP DATABASE if EXISTS HELLO

/*
  修改数据库名：
              ALTER DATABASE 数据库名
                    [DEFAULT] CHARACTER  SET 字符集
                    [DEEAULT] COLLATE  排序规则；
                    
                    
              注意：只能更改数据库的字符集和排序规则，无法直接重命名数据库：
                              如果需要重命名数据库：
                                                    方法一：通过mysqldump备份恢复(数据量大时较慢)
                                                    方法二：创建新数据库，将所有表移动到新库(推荐)
*/
