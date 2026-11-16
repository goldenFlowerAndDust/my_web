// 获取 HTTP 模块
const http = require('http');
// 获取 fs 模块
const fs = require('fs');
// 获取 path 模块，用于拼接绝对路径
const path = require('path');

// 构建服务器
const Server = http.createServer();

// 数据文件的绝对路径：以「本文件所在目录」为基准，不受启动目录影响
const jsonPath = path.join(__dirname, 'packdocut.json');

Server.on("request", (req, res) => {
    // 解决跨域问题；用 file:// 打开页面时 Origin 是 null，必须放行
    res.setHeader("Access-Control-Allow-Origin", "*");

    fs.readFile(jsonPath, "utf-8", (err, data) => {
        if (err) {
            // 读取失败也要给浏览器一个明确的回应，否则前端会一直等
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            return res.end("读取 packdocut.json 失败：" + err.message);
        }
        // text/plain：浏览器端拿到的是字符串，前端再用 JSON.parse 解析
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(data);
    });
});

Server.listen(3000, () => {
    console.log("服务器创建成功！http://localhost:3000");
});
