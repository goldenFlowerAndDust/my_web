/*   获取输入框文本   */
let text = document.getElementById('text');
// 获取添加按钮
let button = document.getElementById('button');
// 获取tbody 清单
let tbody = document.getElementById('tbody');

button.onclick = function () {
    //1. 获取用户输入，去掉首尾空格
    let textText = text.value.trim();
    if (textText === "") {
        alert("请输入待办事项")
        return
    }

    // 创建新行
    let newRow = document.createElement("tr");

    // 创建第一个单元格(复选框)
    let tdCheck = document.createElement("td");
    let chk = document.createElement("input");
    chk.classList.add("togo——checkbox") // classList比className先进(解决+=忘记留空格问题)。add【类似于+=】、remove【删除类】、toggle【存在删除、不存在添加】
    chk.type = 'checkbox';
    tdCheck.appendChild(chk);
    newRow.appendChild(tdCheck);
    chk.onclick = function () {
        updateStats()
        pnduan();
    }

    // 创建第二个单元格，将用户输入显示在内
    let tdText = document.createElement("td");
    tdText.textContent = textText;
    newRow.appendChild(tdText);

    //创建第三个单元格,删除按钮(注意是整个行删除)
    let tdDete = document.createElement('td')
    let Del = document.createElement("button");
    Del.className = "button"; // className 只添加等号，覆盖全面所有累，+= ，才是多个类添加，但是需要在最前面留空格(不留则拼成新的字符串)
    Del.textContent = '删除'
    Del.onclick = function () {
        // 为删除按钮，绑定事件；单击移除当前行
        newRow.remove(); //移除整行
        updateStats()
        pnduan();
    };

    tdDete.appendChild(Del)
    newRow.appendChild(tdDete);

    // 将新行添加入表格当中
    tbody.appendChild(newRow);

    //清空输入框
    text.value = "";
    updateStats()
}

// 全选事件
let checkboxS = document.getElementById('checkbox');
checkboxS.onclick = function () {
    let checkbox = document.querySelectorAll('.togo——checkbox'); // 注意添加前缀 类(.) id(#) 伪类(::) 伪元素(:)
    checkbox.forEach(item => {
        item.checked = checkboxS.checked;
    })
    updateStats()
    pnduan();
}

// 反选事件
let btns = document.getElementById('btnS');
btns.onclick = function () {
    let checkbox = document.querySelectorAll('.togo——checkbox');
    checkbox.forEach(item => {
        item.checked = !item.checked;
    })
    updateStats()
    pnduan();
}

//总计/已完成
function updateStats() {
    let rows = document.querySelectorAll('#tbody tr');
    let total = rows.length;
    let completed = 0;
    rows.forEach(row => {
        let check = row.querySelector('.togo——checkbox');
        if (check && check.checked) completed++;
    })
    document.getElementById('total').innerText = String(total);
    document.getElementById('completed').innerText = String(completed);
}

// 全选复选框与子复选框联动
function pnduan() {
    let result = true
    let checkbox = document.querySelectorAll('.togo——checkbox');
    checkbox.forEach(item => {
        if (!item.checked) {
            result = false
        }
    })
    checkboxS.checked = result;
}

//清除所有待办清单 (清空tbody的所有内容)
let clearAllBtn = document.getElementById('btn');
clearAllBtn.onclick = function () {
    tbody.innerHTML = "";
    updateStats();
    pnduan();
}