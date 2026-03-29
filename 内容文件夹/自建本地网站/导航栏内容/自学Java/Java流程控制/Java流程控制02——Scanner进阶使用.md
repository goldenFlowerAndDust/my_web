# Java流程控制02——Scanner进阶使用

## Scanner进阶操作1

### 利用Scanner在同意一项目多次输入并返回结果：

步骤：

- 新建一个名为(Scanner进阶操作1)的类

- 导入Scanner类

- 创建main方法

  - 注意：
    - Scanner类在main方法内，是作为局部变量
    - Scanner类在实例变量中，是作为一个字段

- 在main方法内，创建Scanner的基本语法

- ```java
  scanner name = new Scanner(System.in);
  ```

- 定义变量名与变量值

- 在每个Scanner前打印对应的标题

- 使用if判断输入的值是否正确，并学会else(那么)的使用

  - else：意思是如果输入的不符合if的内容，那么就会越过if，输出else的内容

- 以Scanner变量名.close();结尾

```java
//先导入Scanner类
import java.util.Scanner;
//新建项目和main方法
public class Scanner进阶操作1{
    public static void main(String[] args){
        //在main方法内，创建Scanner的基本语法
        Scanner scan = new Scanner(System.in);
        //先从键盘导入数据——定义变量名与变量值
        String name = "my_grandfather";
        int i =10;
        float f = 15.3F;
        double d = 15.5D;
        
        //为了更好的观赏，在每个Scanner前打印对应的标题
        
        //第一个输入并输出结果——nextLine
        System.out.println("请输入字符串：");
        //使用if判断输入的值是否正确，并使用else(那么)方法
        //if判断是否是字符串
        if(scan.hasNextLine()){
        //命名变量name，来接收scan的返回值
            name = scan.nextLine();
        //打印并注释结果
            System.out.println("字符串数据："+name);
        //当输入结果非字符串时，直接越过if，运行else里的内容
        }else{
            System.out.println("你输入的不是字符串!");
        }
                    
        //第二个输入并输出结果——nextInt
        System.out.println("请输入整数：");
        //使用if判断输入的值是否符合数据类型，并使用else方法
        if(scan.hasNextInt()){
            i = scan.nextInt();
            System.out.println("整数数据："+i);
        }else{
            System.out.println("你输入的不是整数!")；
        }
		    
    	//第三个输入并返回结果——nextFlost
        System.out.println("请输入小数:");
       //使用if判断输入的值是否符合数据类型，并使用else方法
        if(scan.hasNextFloat()){
            f = scan.nextFlost();
            System.out.println("小数数据："+f);   
        }else{
            System.out.println("你输入的不是小数!")             
        }
       //第四个输入并输出结果——nextDouble
        System.out.println("请输入小数：");
       //使用if判断输入的值是否符合数据类型，并使用else方法
        if(scan.hasNextFloat()){
            d = scan.nextFlost();
            System.out.println("小数数据："+d);   
        }else{
            System.out.println("你输入的不是小数!")             
        }                              

        //别忘了结尾要终止Scanner方法
        //形式：Scanner变量名.close();
        scan.close();
    }	
    
    
}
```

- 在IDEA运行及注意事项

![image-20250827181706524](./Java流程控制02——Scanner进阶使用.assets/image-20250827181706524.png)

![image-20250827183849978](./Java流程控制02——Scanner进阶使用.assets/image-20250827183849978.png)

![image-20250827183814286](./Java流程控制02——Scanner进阶使用.assets/image-20250827183814286.png)

- 注意事项：
  1. 正常情况下，只要输入的数据类型正确，代码会依次运行，不会触发else
  2. 当遇到不符合的数据类型时的状态：
     - 首先他会在当前数据类型，越过if，运行else的内容
     - 然后会按照当前数据类型，往下一 一对应，直到符合为止
     - 若没有，往后依次运行else，直到结尾
     - 当浮点数类型输入整数时，会将整数升格为浮点数，并输出结果。
     - 最后结尾以：Scanner.close();

## Scanner进阶操作2

### 

```
操作流程：
  输入多个数字，并求其总和与平均数
  每一个数字用回车确认
  通过输入非法数字来结束输入并输出执行结果：
```

步骤：

- 新建一个名为(Scanner进阶操作2)的类

- 导入Scanner类

- 创建main方法

- 在main方法内，创建Scanner的基本语法

- ```java
  scanner name = new Scanner(System.in);
  ```

- 定义变量名及变量值

- 打印标题

  - 如：

    - ```java
      Sytem.out.println("请输入数字：")
      ```

- 输入while方法

  - while方法：循环方法
  - 重复运行while的内容，直到违反输入内容终止。

- 打印求和、平均值的结果
- Scanner.close();结尾

```java
import java.util.Scanner
    
public class Scanner进阶操作2{
    public static void main(String[] args){
        Scanner scan = new Scanner(System.in);
        //定义求和变量
        double sum = 0.0d;
        //定义计算输入了多少数字变量
        int m = 0;
        //创建while方法,并定义规则：hasnextDouble，也就是说，一旦输入非double数据类型(及String类型)，循环终止并结束运行，打印最终结果
        while(scan.hasNextDouble()){
            //创建一个变量名，接收键盘输入的值
            double c = scan.nextDouble();
            //计算输入了多少数字
            //意思是，每输入一个数字，结果便加1
            b = b + 1;
            //计算求和值
            //意思是：最后求和值等于变量名的值+输入的值
            sum = sum + c;
            //为了方便观赏，可以打印解释，运行的结果
            System.out.println("你输入了第"+b+"个数据，然后当前结果sum="+sum);
            //已知总的个数为b，求和为sum,这平均值的总数除以个数(sum / b)
            System.out.println("当前平均值为："+(sum / b));                          
        }
        //打印最后的结果
        System.out.println(b+"个数求和值为"+sum);
        System.out.println(b+"个数的平均值为"+(sum / b));
        //别忘了以Scanner.close();结尾
        scan.close();
    }
}
```

- 在IDEA运行及注意事项：

![image-20250827192321644](./Java流程控制02——Scanner进阶使用.assets/image-20250827192321644.png)

![image-20250827192220800](./Java流程控制02——Scanner进阶使用.assets/image-20250827192220800.png)

- 注意事项：
  - 循环的结束是与定义的数据类型对应的(比如上面代码，定义的是hasNextDouble)
  - 每一次循环是以按Enter开始
  - 最后的结尾：Scanner的变量名.close();
