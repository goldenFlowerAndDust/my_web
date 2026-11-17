/* 命令创建表 create table if not exists 表格名{
    字段  字符类型()——可多次建立  设置字段就是设置列。
  
    关于数据类型：
           一、字符类型：用来存储文字、字母、符号(数字也可以强行用，但是会变成文本数字，不能计算，且浪费存储空间和计算资源)
              1.char(n)：定义长度[固定占n个字符空间] 0~255个字符
              2.varchar(n):定义最多存n个字符[按实际内容动态分配] 0~65535个字符 ~ 由于会受整行大小限制，实际最大约21844个字符(UTF-8下)
              3.text、tinytext、mediumtext\longtext【不叫括号，按字体内容决定】
                1）tinytext 最高【255个字节】
                2) text 最高【65535字节】~ 64KB
                3）mediumtext 最高【16777215字节】 ~ 16MB
                4)LONGTEXT 最高【4294967295字节】 ~ 4GB
            
          二、数值类型：用来存储数值，用于计算和比较
          
             2.整数类型：int(n)、tinyint(n)、smallint(n)、mediumint(n)、bigint(n)
                1)括号里的n是显示宽度，不影响实际存储范围。
                2)只有在是使用zerofill属性时，不足n位补零显示。
                3)注意：MySQL 8.0+ 已不推荐使用显示宽度，但是语法仍然兼容
                4)int(n)：取值范围固定的( -21亿 ~ 21亿 )
                
             3.浮点类型：float(m,d)、double(m,d)
                1）其中 m = 总位数 ， d = 小数位数
                2）float(m,d)/double(m,d):存储位数是近似值，存在精度误差
                3）但是它们是近似值，可能产生浮点误差；括号主要影响【显示和四舍五入】，不严格限制存储范围
                
             4.精确小数类型：decimal(m,d)、numberic(m,d)
                1）m = 总位数(精度)  , d = 小数位数
                2）如decimal(10,2)可存储，最高10位数(指的是个数)  其中小数部分占2位  ，则整数部分占8位
                3）严格限制存储范围和精度(适合金额等需要精确计算的场景)
                4）decimal(m,d) ： m最大65 ， d最大30.这是精确类型，适合存金额。
                
          三、日期时间类型：datetime(n)、timestamp(n)、time(n)、date、year
                1）括号里的n是【秒的小数部分精度(微秒)】,取值范围是0~6
                2)date、year：通常不加括号、无参数
                
          四、二进制类型binary(n)、varbinary(n)
                1)类似char/varchar，但是存储的是字节串(二进制数据)，n表示字节长度
                2)blob、tinyblob、mediumblob、longblob：不用加括号类型本身决定最大长度
                3)binary(n)/varbinary(n)：上限与cahr/varchar相同，但是存储的单位是字节不是字符
                4)blob系列：上限同text系列，存储二进制数据(图片、文件等)
                    ·tinyblob 最高【255个字节】
                    ·blob 最高【65535字节】~ 64KB
                    ·mediumblob 最高【16777215字节】 ~ 16MB
                    ·longblob 最高【4294967295字节】 ~ 4GB
             
            
}