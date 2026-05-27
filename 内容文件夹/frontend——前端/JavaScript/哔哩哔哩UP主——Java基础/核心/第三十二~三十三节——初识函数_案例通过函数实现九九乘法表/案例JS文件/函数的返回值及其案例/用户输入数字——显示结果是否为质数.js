document.getElementById("bth").onclick = function () {
    let num = document.getElementById("number")
    let text = document.getElementById("text")

    let number = parseFloat(num.value)

    function isParime(numb) {
        if (!Number.isInteger(numb) || numb <= 1) {
            return false  // 当number小于1，则退出函数，并且返回false
        }
        for (let i = 2; i < numb; i++) { // 小于i <= numb ,永远成立，也就是说，大于1的数，都会变成不是质数
            if (numb % i === 0) return false
        }
        return true
    }

    if (isParime(number)) {  // 0 不是质数
        text.innerHTML = `<span>${number}：是质数</span>`  // 因为value只能输出纯文本，无法解析HTML。且表单元素内容只能是纯文本，所以，使用div替代
        // innerHTML 与value 不同，它可以解析HTML，用它会更方便
    } else {
        text.innerHTML = `<span>${number}：不是质数</span>`
    }
}