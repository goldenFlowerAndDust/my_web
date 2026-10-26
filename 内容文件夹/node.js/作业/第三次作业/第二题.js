/*
*
*   使用 fetch 异步请求运势接口，分别用 Promise.then 和 async/await 实现并输出结果。代码截图和结果结果。
    接口地址：https://api.shanhe.kim/API/今日运势.php
*
* */


// 使用fetch.then
fetch(`https://api.shanhe.kim/API/今日运势.php`)
.then(res => {
    if (!res.ok) {
        throw new Error(`请求失败，状态码：${res.status}`)
    }
    return res.json()
})
.then(user=> {
    console.log(`收到用户输入数据：${JSON.stringify(user).split(',').join('\n')}`)
})
.catch(err => {
    console.log(`捕获错误：${err.message}\n`)
})

// 使用 async/await
async function getUser() {
    try {
        console.log(`await 开始用户请求.....`)
        const res = await fetch(`https://api.shanhe.kim/API/今日运势.php`)
        if (!res.ok) {
            throw new Error(`请求失败，状态码：${res.status}`)
        }
        const user = await res.json()
        console.log(`收到用户输入数据：${JSON.stringify(user).split(',').join('\n')}`)
    } catch(err) {
        console.log(`await 捕获错误：${err.message}`)
    }
}
getUser()