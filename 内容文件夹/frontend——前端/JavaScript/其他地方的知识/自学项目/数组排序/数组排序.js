let text = document.getElementById('数据')
let ZXJG = document.getElementById("正序结果")
let DXJG = document.getElementById("倒序结果")

document.getElementById("正序").onclick = function () {
    let Text = text.innerText.trim()
    if (Text === '') {
        ZXJG.innerHTML = '<span>请输入数字数组</span>'
        return
    }
    let Arr = Text.split(',').map(item => parseFloat(item.trim()))
    if (Arr.some(isNaN)) {
        ZXJG.innerHTML = '<span>请确保，是以逗号隔开的数组</span>'
        return
    }
    // 冒泡 正序
    for (let i = 0; i < Arr.length - 1; i++) {
        for (let j = 0; j < Arr.length - 1 - i; j++) {
            if (Arr[j] > Arr[j + 1]) {
                let temp = Arr[j];
                Arr[j] = Arr[j + 1]
                Arr[j + 1] = temp;
            }
        }
    }
    ZXJG.innerHTML = Arr.join(',')
}

document.getElementById("反序").onclick = function () {
    let Text = text.innerText.trim()
    if (Text === '') {
        DXJG.innerHTML = '<span>请输入数字数组</span>'
        return
    }
    let Arr = Text.split(',').map(item =>
        parseFloat(item.trim())
    )
    if (Arr.some(isNaN)) {
        DXJG.innerHTML = '<span>请确保，是以逗号隔开的数组</span>'
        return
    }

    for (let i = 0; i < Arr.length - 1; i++) {
        let temp = i;
        for (let j = i + 1; j < Arr.length; j++) {
            if (Arr[j] > Arr[temp]) {
                temp = j
            }
        }
        if (temp !== i) {
            [Arr[i], Arr[temp]] = [Arr[temp], Arr[i]];
        }
    }
    DXJG.innerHTML = Arr.join(',')
}