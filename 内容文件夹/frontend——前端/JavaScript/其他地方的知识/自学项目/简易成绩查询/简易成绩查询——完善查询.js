//完善查询
const btnCity_avgScore = document.getElementById("city_avgScore")
const btnEight_Avg = document.getElementById("eight_Avg")
const btnNine_Avg = document.getElementById("nine_Avg")
const btnCity_eightAvg = document.getElementById("city_eightAvg")
const btnCity_nineAvg = document.getElementById("city_nineAvg")
// 结果显示区域
const scoreTbody = document.getElementById("scoreResult")

// 辅助函数：渲染结果表格（接收学生数组，每个学生是 [城市,姓名,语文,数学,英语] 格式）
function renderResult(studentsArray, title) {
    scoreTbody.innerText = ''
    if (studentsArray.length === 0) {
        const row = scoreTbody.insertRow()
        const cell = row.insertCell(0)
        cell.colSpan = 6
        cell.innerText = `${title}没有符合条件的学生`
        return
    }
    for (let stu of studentsArray) {
        const row = scoreTbody.insertRow()
        const city = stu[0]
        const name = stu[1]
        const chinese = stu[2]
        const math = stu[3]
        const english = stu[4]
        const avg = ((chinese + math + english) / 3).toFixed(2)
        row.insertCell(0).innerText = city
        row.insertCell(1).innerText = name
        row.insertCell(2).innerText = chinese
        row.insertCell(3).innerText = math
        row.insertCell(4).innerText = english
        row.insertCell(5).innerText = avg
    }
}

// 同城学生各科成绩总和高于平均分的学生
btnCity_avgScore.onclick = function () {
    if (students.length === 0) {
        renderResult([], '同城学生各科成绩总和高于平均分的学生');
        return
    }
    // 先按城市分组，再计算每个城市的学生总分平均成绩
    const cityMap = {}
    for (let stu of students) {
        const city = stu[0]
        const total = stu[2] + stu[3] + stu[4] // 各科总分
        if (!cityMap[city]) {
            cityMap[city] = {totalScore: 0, count: 0}
        }
        const data = cityMap[city]
        data["totalScore"] += total
        data["count"]++
    }
    // 计算每个城市的平均分
    const avgCityScore = {}
    for (let city in cityMap) {
        const data = cityMap[city]
        avgCityScore[city] = data.totalScore / data.count
    }
    // 筛选：学生个人平均分 > 所在城市平均分
    const result = students.filter(stu => {
        const city = stu[0]
        const total = stu[2] + stu[3] + stu[4]
        return total > avgCityScore[city]
    })
    renderResult(result, `同城学生各科成绩总分高于平均分的学生`)
}
// 平均分小于80分的学生
btnEight_Avg.onclick = function () {
    if (students.length === 0) {
        renderResult([], "平均分小于80分的学生")
        return
    }
    const Filter = students.filter(stu => {
        const avg = (stu[2] + stu[3] + stu[4]) / 3
        return avg < 80
    })
    renderResult(Filter, `小于80分的学生`)
}
// 平均成绩大于90分的学生
btnNine_Avg.onclick = function () {
    if (students.length === 0) {
        renderResult([], "平均成绩大于90分的学生")
        return
    }
    const Filter = students.filter(stu => {
        const avg = (stu[2] + stu[3] + stu[4]) / 3
        return avg > 90
    })
    renderResult(Filter, "平均成绩大于90分的学生")
}
// 某城市平均成绩小于80分的学生
btnCity_eightAvg.onclick = function () {
    if (students.length === 0) {
        renderResult([], "没有学生数据");
        return;
    }

    const cityName = prompt("请输入要查询的城市名：", "")
    if (!cityName) return alert("没有符合的城市")

    //筛选出该城市的所有学生
    const Filter = students.filter(stu => {
        if (stu[0] !== cityName) return false
        const avg = (stu[2] + stu[3] + stu[4]) / 3
        return avg < 80
    })
    if (Filter.length === 0) {
        renderResult([], `城市 "${cityName}" 没有平均分低于80分的学生`)
    } else {
        renderResult(Filter, `城市 "${cityName}" 中平均分低于80分的学生`)
    }
}
// 某城市平均成绩大于95分的顶尖学生
btnCity_nineAvg.onclick = function () {
    if (students.length === 0) {
        renderResult([], "某城市平均成绩大于90分的顶尖学生")
        return
    }
    const cityName = prompt("请输入要查询的城市名：", "")
    if (!cityName) return alert("没有符合的城市")

    // 筛选出该城市的所有学生
    const cityStudents = students.filter(stu => {
        if (stu[0] !== cityName) return false
        const avg = (stu[2] + stu[3] + stu[4]) / 3
        return avg > 95
    })
    // 计算该城市的平均分(所有学生成绩的平均值)
    if (cityStudents.length === 0) {
        renderResult([], `城市 "${cityName}" 没有平均分高于95分的学生`)
    } else {
        renderResult(cityStudents, `城市 "${cityName}" 中平均分高于95分的学生`)
    }
}