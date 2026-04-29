let furit = document.querySelectorAll('.furit') // 获取所有水果复选框

let btn = document.getElementById("btn") // 全选复选框

// 全选反选功能
btn.onclick = function () {
    furit.forEach(furitBtn => {
        furitBtn.checked = !furitBtn.checked
    })
    date();
}

// 更新全选复选框状态
function date() {
    let furits = true  // 假设全部选中
    furit.forEach(furst => {
        if (furst.checked === false) {
            furits = false // 发现一个没中，就赋值false

        }
        btn.checked = furits  // 否则就是true

    })
}

//为每个水果添加绑定事件
furit.forEach(furit => {
    furit.onclick = date
})

// 确定按钮，显示选中水果名称
let okbtn = document.getElementById("mybtn") // 获取确定按钮元素
okbtn.onclick = function () {
    let selected = [];  // 创建一个空数组，用来存放选中水果的名字
    furit.forEach(cb => {  // 遍历每个水果复选框
        //获取复选框父元素li中的文本(去除复选框本身)
        if (cb.checked) { // 只处理被选中的复选框
            let li = cb.parentNode // 获取复选框所在的li元素

            //取li内部的文本内容
            // li的结构是：<li><input....>苹果</li>，文本节点是第二个子节点(索引1)
            let furitName = li.childNodes[1] ? li.childNodes[1].nodeValue.trim() :
                li.innerText.trim()
            if (!furitName) furitName = li.innerText.trim(); // 如果上面取不到就用备用方法
            selected.push(furitName) // 把水果名字添加到数组中
        }
    })
    if (selected.length === 0) {  // 如果没有选中水果
        alert("您还没有喜欢的水果")
    } else {  // 选中的水果，弹窗显示
        alert("您喜欢的水果:\n" + selected.join("\n"))
    }
}