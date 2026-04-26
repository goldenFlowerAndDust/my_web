let text = document.getElementById("sprime") // 获取元素
text.style.margin = "0"
text.style.padding = "0"
// 判断质数方法
function sprime(number) {
    if (isNaN(number)) {
        text.innerHTML = `<span>请使用数值类型!!!</span>`
        return false
    } else if (number <= 1 || !Number.isInteger(number)) {
        text.innerHTML = `<span>请使用大于1的正正整数!!!</span>`
        return false
    }
    for (let i = 2; i < number; i++) {
        if (number % i === 0) return false
    }
    return true
}

// 显示所有质数方法
function showsprime(start, end) {
    let result = ""
    for (let i = start; i <= end; i++) {
        if (sprime(i)) {
            result += `<span style="margin-right: 20px;display: inline-block">${i}</span>`
        }
    }
    return result || '无质数'
}
let sprime1 = showsprime(300, 500,40)
let sprime2 = showsprime(1000, 1500,40)
text.innerHTML = `300~500之间的质数:<br><span>${sprime1}</span><br>1000~1500之间的质数:<br><span>${sprime2}</span>`