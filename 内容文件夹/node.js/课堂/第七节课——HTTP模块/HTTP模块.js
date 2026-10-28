// 导入HTTP模块

let http = require('http')
let fs = require('fs')
let path = require('path')

// 创建HTTP web 服务器 方法：http.createServer()
/*
* 创建一个 HTTP 服务器，让它一直呆在后台监听（Listen）某个端口，随时准备接收别人发来的网络请求（Request），并返回响应（Response）。
* */

http.createServer((req, res) => {
    // req (Request): 顾客的订单（包含了请求的网址、方法、参数等）
    // res (Response): 给顾客上菜的工具（用来写回应内容）

    res.statusCode = 200; //类似状态码！ 2xx 一般表示成功
    // setHeader——>设置：name是暗号，值是对应的要求。有些内置的name，有对应的功能，需要记忆
    res.setHeader('Content-type', 'text/plain; charset=UTF-8') // name:Content-type ——> 浏览器读取文本暗号。值：utf-8->正常识别中文
    res.setHeader('x-Message', '200 OK') // setHeader在不同的状态下，有区别。
    // 比如 200 ，如果值是：地址，浏览器会认为这是一个文本。
    // 当状态是：301、302。且第一个参数是：Location(单词一样即可，不区分大小写)、值是地址，就会自动跳转。但是如果传入的不是地址，那么会报错
    // 但是需要注意的是：不管是：name还是value，都必须是：ASCII码字符。
    res.end('响应成功')
}).listen(3000)

// 要求，端口：250，实现内容，网页不跳转下载地址是：内容文件夹/frontend——前端/JS游戏开发/第七堂课/代码.zip。这个文件
const Server = http.createServer((req, res) => {
    // 1. 指定需要下载的文件
    const filePath = path.join(__dirname,'../../../frontend——前端/JS游戏开发/第七堂课/代码.zip')
    const fileName = '代码.zip'

    // 2. 判断文件是否存在
    if (!fs.existsSync(filePath)) {
        res.statusCode = 404;
        res.setHeader('Content-type', 'text/plain; charset=UTF-8')
        res.end('抱歉文件，文件丢失')

        return // 必须加return，因为，一个服务器，只能有一个。end()
    }

    // 2. 核心响应头：告诉浏览器这是一个附件，强制下载

    // 通过：setHeader下暗号
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="download.zip"; filename*=UTF-8''${encodeURIComponent(fileName)}`
    );

    // 3. 告诉浏览器这是二进制流，不要试图渲染它
    res.setHeader('Content-Type', 'application/octet-stream');

    // 4. 创建文件读取流，并将它通过管道（pipe）直接输送给响应（res）
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

})
Server.listen(250, () => {
    console.log('下载服务器已启动，请访问：http://localhost:250');
});


/*
*   总结：
*       1.通过require——>导入：http 模块
*       2.通过：createServer()——> 搭建服务器
*       3.createServer()————>默认是：on('request',(req,res))：request：请求事件。
*           1）:所以只有一个请求事件，直接createServer()即可
*           2）:如果需要多个事件，必须，声明变量——>将对象赋值到变量。通过变量.on('事件','回调')
*           3）:其他事件：
*                   （1）request：请求事件
*                   （2）connection：当有 TCP 连接建立时触发(可用作底层网络监控)
*                   （3）close：当服务器关闭时触发
*                   （4）error：当服务器发生错误时触发(比如：端口被占用、或者代码崩溃)
*                   （5）upgrade：当客户端请求升级为 WebSocket 时触发。
*      4.on()：createServer()的实例方法，主要是监听事件
*           1）:第一个参数：指定需要监听的事件
*           2）:第二个参数：回调函数。(req,res) => {}
*                   (1)req (Request): 顾客的订单（包含了请求的网址、方法、参数等）
*                   (2)res (Response): 给顾客上菜的工具（用来写回应内容）
*                       1.res.statusCode：读取/写入状态————>影响后续的：res.setHeader()：注意是属性，而不是方法
*                       2.res.setHeader()：设置：不同的name，功能不一样。value：值，两个参数必须是：ASCII码字符串。
*                       3.res.end()：类似文件读取的close()，一个事件，只能出现一次，后续所有的操作，一律失效。当内部判断多个分支，记得加return。
*     5.setHeader()：方法极其重要，尤其是：name，有内置的属性，可以不背，但必须有印象，后续查资料即可。
* */