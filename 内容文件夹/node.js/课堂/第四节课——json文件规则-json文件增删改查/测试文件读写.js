/*获取必要的 fs 模块*/

let fs = require('fs')

/*
* 要求：
    在当前目录创建一个文件 task1.txt
    用覆盖写入模式，把下面这个数组里的名字，每行写一个：
    const names = ['小明', '小红', '小刚', '小美'];
写入完成后，控制台打印：task1.txt 写入完成
*
* */

// 需要写入的文件
const names = ['小明', '小红', '小刚', '小美'];
// 覆盖写入————异步执行
fs.writeFile('./task1.txt', names.join('\n'), {encoding: 'utf-8', flag: 'w'}, (err) => {
    if (err) {
        console.error('文件打开失败')
    } else {
        console.log('task1.txt 写入完成')
    }
})

// 覆盖写入————同步执行
try {
    fs.writeFileSync('./task1.txt', names.join('\n'), {encoding: 'utf-8', flag: 'w'})
    console.log('覆盖写入-同步写入完成')
} catch {
    console.error('文件创建，写入失败')
}

/*
*   要求：

    继续用 task1.txt（不要重建），在文件末尾追加两个名字：'小强'、'小丽'

    追加时每行一个，和原有内容保持一致

    追加完成后，控制台打印：追加完成，当前文件内容：

    然后把整个文件读出来，打印在控制台（用 readFileSync）

    用异步方式追加（fs.appendFile 带回调）
* */

let appended_name = ['小强', '小丽']
let new_name = '\n' + appended_name.join('\n')
// 按要求，异步执行，追加
fs.appendFile('./task1.txt', new_name, {encoding: 'utf-8', flag: 'a'}, (err) => {
    if (err) {
        console.error('文件追加写入失败')
    } else {
        console.log('文件追加成功')
    }
    console.log('下面开始读取文件')
    // 按要求：带回调(异步)，输出文件内容
    fs.readFile('./task1.txt', 'utf-8', (err, data) => {
        if (err) {
            console.error('文件读取失败，请检查文件是否存在')
        } else {
            console.log(data)
        }

        fs.unlink('./task1.txt', (err)=>{
            if (err) {
                console.log('删除失败，请检查文件是否存在')
                return
            }
            console.log('删除文件:[task1.txt]成功，异步执行')
        })
    })

})

// 删除文件
/*
*   unlink————>异步执行 (防止，抢执行顺序，放入异步嵌套)
*   unlinkSync————>同步执行
* */

/*以下是错误示范，正常项目，应该避免两个删除方法，删除同一个文件，会产出BUG*/
try {
    fs.unlinkSync('./task1.txt')
    console.log('删除文件:[task1.txt]成功，同步执行')
} catch {
    console.log('删除失败，请检查文件是否存在')
}


/*
*   注意事项：
*       1.异步执行的回调顺序由，异步处理时间确定，有时尽管先进异步队列，后队比前面前输出结果，会插队。抢跑
*       2.解决办法：将后续需要的异步放入当前异步内，总结异步嵌套，后面还会有更好的异步处理方式
*       3.Windows缓存延迟：在当前项目中，writeFile-readFile-unlink，三个异步执行顺序均没有问题，但是，writeFile创建文件后，立刻被读取，当时因为缓存问题，没能及时更新索引，所以结果是报错
*       4.解决办法：
*               （1）.要么全同步（顺序绝对可控）
                （2）.要么全异步嵌套（用回调或 async/await 串联）
                （3）.不要混用——因为混用时“同步抢跑、异步滞后”是必然的
*       5.为了练习两种删除方法，同时写，在一个项目中，避免同时使用两种方法删除同一个文件，因为这是很蠢的习惯。
* */

