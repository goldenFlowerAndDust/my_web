document.getElementById("button").onclick = function () {

    let yearInput = document.getElementById("year")
    let monthInput = document.getElementById("month")
    let resultInput = document.querySelector("#table input[readonly]");

    let year = parseFloat(yearInput.value)
    let month = String(monthInput.value)  // ✅ 改为 String()

    // 年份判断
    if (isNaN(year)) {
        yearInput.value = "请输入有效年份(数值类型)"

    } else if (yearInput.value === "") {
        yearInput.value = "请输入有效年份"

    } else if (year <= 0) {
        yearInput.value = "请输入有效年份(正数)"

    } else if (!Number.isInteger(year)) {
        yearInput.value = "请输入有效年份(正整数)"

    } else if (year % 400 === 0 || year % 4 === 0 && year % 100 !== 0) {
        // 闰年
        yearInput.value = `输入的年份是:${year}，是闰年`


        let day
        // ✅ 修改：判断月份不为空
        if (month !== "") {
            switch (month) {
                case "1":
                case "3":
                case "5":
                case "7":
                case "8":
                case "10":
                case "12":
                    day = 31
                    monthInput.value = `${month}月`
                    break
                case "2":
                    day = 29
                    monthInput.value = `${month}月`
                    break
                case "4":
                case "6":
                case "9":
                case "11":
                    day = 30
                    monthInput.value = `${month}月`
                    break
                default:
                    monthInput.value = `请输出有效月份`
            }
            resultInput.value = `${day}天`  // ✅ 移到 switch 外面
        } else {
            monthInput.value = "请输入月份"  // ✅ 月份为空时的提示
        }
    } else {
        // 平年
        yearInput.value = `输入的年份是:${year}，是平年`


        let day
        // ✅ 修改：判断月份不为空
        if (month !== "") {
            switch (month) {
                case "1":
                case "3":
                case "5":
                case "7":
                case "8":
                case "10":
                case "12":
                    day = 31
                    monthInput.value = `${month}月`
                    break
                case "2":
                    day = 28
                    monthInput.value = `${month}月`
                    break
                case "4":
                case "6":
                case "9":
                case "11":
                    day = 30
                    monthInput.value = `${month}月`
                    break
                default:
                    monthInput.value = `请输出有效月份`
            }
            resultInput.value = `${day}天`  // ✅ 移到 switch 外面
        } else {
            monthInput.value = "请输入月份"  // ✅ 月份为空时的提示
        }
    }
}