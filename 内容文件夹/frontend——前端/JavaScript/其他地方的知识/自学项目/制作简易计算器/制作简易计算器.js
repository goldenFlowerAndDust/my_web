let textinput = document.getElementById("textinput")
let numberinput = document.querySelectorAll(".number")
numberinput.forEach(num => {
    num.onclick = function () {
        textinput.value += this.value
    }
})
document.getElementById("bth").onclick = function () {
    textinput.value = ""
}
let operator = document.querySelectorAll(".bth")
operator.forEach(oper => {
    oper.onclick = function () {
        textinput.value += this.value
    }
})
let equals = document.getElementById("bth2")
if (equals) {
    equals.onclick = function () {
        try {
            textinput.value = eval(textinput.value)
        } catch {
            textinput.value = "输入的是非法表达式"
        }
    }
}