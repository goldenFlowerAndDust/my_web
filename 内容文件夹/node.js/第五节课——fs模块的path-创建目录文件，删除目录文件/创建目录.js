// 获取 fs 模块
let fs = require('fs')

fs.mkdir('./测试',(err,path)=>{
    if(err) {
        console.log('创建失败：',err)
        return false
    }

    // mkdir————>模块 fs 的方法
    /*
    *   1.第一个参数(path)：需要创建的文件夹。默认不支持递归：也就是只会创建路径最后的文件夹。前面的路径不存在默认报错
    *   2.第二个参数(options)：
    *           (第一个参数-recursive)：指定是否使用递归的方式创建，默认：false。当然改为true，则支持，那么会从第一层开始直到最后，自动创建
    *           (第二个参数-mode)：设置目录权限，默认值是：0777，Windows操作系统不支持
    *   3.第三个参数(callback)：回调函数，第一个错误信息——>一般err接收，第二个：创建成功后地址信息————>一般path接收：
    *           (注意)：path：在没有递归，回调是undefined，
    *                  递归：既是创建多个目录，则返回第一个创建目录的地址信息：
    *                           (1)：返回的地址类型与传入的path类型一致(相对地址、绝对地址)
    *                           (2)：比如：mkdir('./a/b/c',{recursive:true},(err,path))。假设b不存在，a存在。则path接收的返回值是：./a/b
    *                           (2)：比如：mkdir('D:/e/g/h/a/b/c',{recursive:true},(err,path))。假设b不存在，a存在。则path接收的返回值是：D:/e/g/h/a/b。
    * */

    console.log('创建成功')
    console.log(path)
})
fs.mkdir('./测试删除',(err,path)=>{
    if(err) {
        console.log('创建失败：',err)
        return false
    }

    // mkdir————>模块 fs 的方法
    /*
    *   1.第一个参数(path)：需要创建的文件夹。默认不支持递归：也就是只会创建路径最后的文件夹。前面的路径不存在默认报错
    *   2.第二个参数(options)：
    *           (第一个参数-recursive)：指定是否使用递归的方式创建，默认：false。当然改为true，则支持，那么会从第一层开始直到最后，自动创建
    *           (第二个参数-mode)：设置目录权限，默认值是：0777，Windows操作系统不支持
    *   3.第三个参数(callback)：回调函数，第一个错误信息——>一般err接收，第二个：创建成功后地址信息————>一般path接收：
    *           (注意)：path：在没有递归，回调是undefined，
    *                  递归：既是创建多个目录，则返回第一个创建目录的地址信息：
    *                           (1)：返回的地址类型与传入的path类型一致(相对地址、绝对地址)
    *                           (2)：比如：mkdir('./a/b/c',{recursive:true},(err,path))。假设b不存在，a存在。则path接收的返回值是：./a/b
    *                           (2)：比如：mkdir('D:/e/g/h/a/b/c',{recursive:true},(err,path))。假设b不存在，a存在。则path接收的返回值是：D:/e/g/h/a/b。
    * */

    console.log('创建成功')
    console.log(path)
})