// mjs————>没有require 使用import导入
import { conn } from "./ab.mjs" // 导入mysql连接池

// 导入path 模块
import path from "node:path"

// 导入http 模块
import http from "node:http"

// 搭建服务器
let https = http.createServer()
https.on('request', ()=>{

    async function ab(){
        try {
            // 功能一：查询表格
            const [rows] = await conn.query("SELECT * FROM students;")
            console.log(rows)
        } catch(err) {
            console.log(err.message)
        } finally {
            conn.end()
        }
    }
})



