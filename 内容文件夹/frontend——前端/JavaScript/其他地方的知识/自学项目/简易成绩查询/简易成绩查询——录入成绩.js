// 录入学生成绩

// 创建数组收集信息
let students = []

//获取"录入成绩"按钮
document.getElementById("enter_grades").onclick = function () {
    // 每次点击，重新获取第一行输入的新值
    const fistRpw = document.querySelectorAll("#inputRow .oper")
    const city = fistRpw[0].innerText.trim()
    const name = fistRpw[1].innerText.trim()
    const chinese = parseFloat(fistRpw[2].innerText.trim())
    const math = parseFloat(fistRpw[3].innerText.trim())
    const english = parseFloat(fistRpw[4].innerText.trim())

    // 简单校验：城市、姓名不能为空，成绩必须是有效数字
    if (!city || !name || isNaN(chinese) || isNaN(math) || isNaN(english)) {
        return alert("请完整填写城市、姓名和各科成绩(数字)")

    }

    // 创建学生对象并存入数组
    const student = [city, name, chinese, math, english]
    students.push(student)

    //动态添加，显示表格 #score中
    const scoreTbody = document.getElementById("score")
    const newRow = scoreTbody.insertRow() // 直接在 tbody末尾添加行

    //插入单元格 inseCell插入单元格
    const cityCell = newRow.insertCell(0)
    const nameCell = newRow.insertCell(1)
    const chineseCell = newRow.insertCell(2)
    const mathCell = newRow.insertCell(3)
    const englishCell = newRow.insertCell(4)
    const AvgCell = newRow.insertCell(5)
    //为单元格附上内容
    cityCell.innerText = city
    nameCell.innerText = name
    chineseCell.innerText = chinese
    mathCell.innerText = math
    englishCell.innerText = english
    const avg = ((chinese + math + english) / 3).toFixed(2)
    AvgCell.innerText = avg


    // 清空第一行，方便继续录入
    fistRpw.forEach(cell => cell.innerText = "")

    //提示录入成功
    console.log(`已录学生：${name},当前共有${students.length}人`)
}