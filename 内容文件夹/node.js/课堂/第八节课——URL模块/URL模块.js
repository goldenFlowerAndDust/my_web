let url = require('url')

let Url = "https://goldenfloweranddust.github.io/my_web/#"

let parseurl = url.parse(Url) // 已经弃用——功能，将地址转化为json对象——结果为对象

console.log(parseurl)

let strUrl = url.format(parseurl) // 将json对象，打包成地址——结果为字符串

console.log(strUrl)