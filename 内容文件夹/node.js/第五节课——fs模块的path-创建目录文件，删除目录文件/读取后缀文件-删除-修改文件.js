// 获取 fs 模块
// 获取 path 模块
let path = require('path')
let fs = require('fs')

fs.readdir('./测试', (err, files) => {
    if (err) {
        console.error(err)
    }
    console.log(files)

    // 重命名文件 fs.rename，修改后缀
    let news = files.filter((f) => {
        return f.endsWith('.ppts')
    })
    console.log(news)
    news.forEach(f => {
        let ext = path.extname(f)
        let base = path.basename(f,ext)
        let new_name = base + '.pptx'

        fs.rename(
            path.join(`./测试`,f),
            path.join('./测试',new_name),
            (err)=>{
                if (err) {
                    return console.error(err)
                }
        }
        )
    })

    // 删除后缀文件。
    /*
    *   删除文件用：fs.unlink():
    *       :只有两个参数
    *           (1):path：删除文件的路径
    *           (2):callback：只有一个回调，错误信息，一般由:err参数接收
    * */

    // 要求删除后缀名为.pptx的文件

    // 先获取所有.pptx文件
    let pptx = files.filter((f)=>f.endsWith('.pptx'))

    pptx.forEach(f=>{
        fs.unlink(`./测试/${f}`,(err)=>{
            if (err) {
                return console.error(err)
            }
        })
    })

    // 删除名为【测试删除】目录
    // 两种方法:
    /*
    *   fs.rmdir：只能删除空目录。且也不推荐
    *   fs.rm(path,options,callback):
    *       (1):默认不递归删除，删除空目录，包含文件或子文件夹报错
    *       (2)options:
    *           1.参数一(recursive)：递归删除，默认是false
    *           2.参数二(force)：目录不存在是否报错，默认：false(报错)
    *       (3)callback：回调函数，只会返回错误结果，一般用:err接收
    * */
    fs.rm('./测试删除',{recursive:true,force:true}, (err)=>{
        if (err) {
            return console.error(err)
        }
        console.log(`删除成功`)
    })
})