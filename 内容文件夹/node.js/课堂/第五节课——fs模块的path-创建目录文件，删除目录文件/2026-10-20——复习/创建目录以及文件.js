// @ts-check

// 导入模块
const fs = require('fs') // File System（文件系统）
const path = require('path') // path 路径


// 创建文件夹 创建【测试删除】以及【测试】文件夹——————>严格先【测试】再【测试删除】

//工具函数————>创建文件/文件夹
// 采用异步编程语法：async-await
async function mkdirp() {
    try {

        console.log('开始创建-[测试]文件夹')
        await fs.promises.mkdir('./测试', {recursive: true})
        console.log('[测试]文件夹，创建完成')

        console.log('开始创建-[测试删除]文件夹')
        await fs.promises.mkdir('./测试删除', {recursive: true})
        console.log('[测试删除]文件夹，创建完成')

        // 读取目录
        const readdirs = await fs.promises.readdir('../2026-10-20——复习')
        console.log(readdirs)

        //批量创建————>5个docx、pptx、txt、html、css文件
        const suffix = ['docx', 'pptx', 'html', 'css']
        for (const fix of suffix) {
            for (let j = 1; j <= suffix.length + 1; j++) {
                await fs.promises.writeFile(`./测试/第${j}个${fix}文件.${fix}`, '')
            }
        }

        // 读取目录【测试】
        const readirCS = await fs.promises.readdir('./测试')
        console.log(`测试目录下的文件/文件夹有：${readirCS.join('\n')}`) // ','.join(readdirCS)
    } catch (err) {
        console.error('报错了，具体原因是：', err.message)
    }
}

//工具函数————>重命名
// 进阶————>修改指定文件后缀(.css—>.md、.txt——>.js、.pptx->.python、.docx->.bat)
async function Modfiy() {
    const extMap = {
        '.css': '.md',
        '.txt': '.js',
        '.pptx': '.py',
        '.docx': '.bat',
    }
    // 先获取目录下的所有文件——————>readdirCS
    const readirCS = await fs.promises.readdir('./测试')
    for (const fixs of readirCS) {
        // 获取后缀
        const ext = path.extname(fixs)
        const oldn = ext.replace('.', '')
        if (extMap[ext]) {
            const oldPath = path.join('./测试', fixs)
            const newname = fixs.replace(ext, extMap[ext]).replace(oldn, extMap[ext].replace('.', ''))
            const newPath = path.join('./测试', newname)

            // 重命名
            await fs.promises.rename(oldPath, newPath)
            console.log(`${fixs} 重命名为 ${newname}`)
        }
    }
}

// 工具函数————>删除文件/文件夹
async function rm() {
    try {
        await fs.promises.rmdir('./测试删除')
        console.log('文件夹：【删除测试】已删除')

        await fs.promises.rm('./测试', {recursive: true, force: true})
        console.log('文件夹：【测试】已删除')
    } catch (err) {
        console.error(err.message)
    }
}

// 统一调用工具函数
async function mod() {
    // 创建目录————>文件
    await mkdirp()

    // 修改后缀
    await Modfiy()

    // 删除文件/文件夹
    await rm()
}


//运行函数
mod()


/*
*   知识总结：
*       1.async-await：
*               (1)：async ：代码快内部才是异步，代码块外部，同步和异步同样执行。
*               (2):所以：async——>异步编程。< 同步 === 异步。因为async外的异步可能会抢跑
*               (3): await ： async 代码块内的关键字。遇到await 则执行完 await 之前，后续代码不会执行
*               (4): 使用await的前提是必须：promise。————> 不可回调。目前：fs模块有promise属性
*       2. fs:
*           1.创建目录：fs.mkdir()【规定必须有：callback】————>async内————> await fs.promises.mkdir()【没有：callback】
*           1.删除目录：fs.rmdir()/fs.rm【规定必须有：callback】————>async内————> await fs.promises.rmdir()/fs.promises.rm【没有：callback】
*                   1）.rmdir：文件夹内有文件，无法删除。同样有：递归删除以及非递归删除，以及文件不存在不操作
*                   1）.rmdir：文件夹有文件，能删除(前提使用递归)。同样有：递归删除以及非递归删除，以及文件不存在不操作
*           1.重命名：fs.rename()【规定必须有：callback】————>async内————> await fs.promises.rename()【没有：callback】
*                   1）.第一个参数：旧地址
*                   2).第二个参数：新地址
*                   3) .需要与：path.join搭配使用
*           1.创建文件：fs.writeFile()【规定必须有：callback】————>async内————> await fs.promises.writeFile()【没有：callback】
*           2.文件操作相关，其他地方有总结。
*      3. path:
*           1.path.basename（取文件名）

            2.path.extname（取后缀名）

            3.path.dirname（取目录名）
*
* */