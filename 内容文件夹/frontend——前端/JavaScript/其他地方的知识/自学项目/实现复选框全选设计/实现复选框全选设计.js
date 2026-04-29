let checkbox = document.getElementById("add_checkbox")
let add_SelectorAll = document.querySelectorAll(".add_checkbox")
let button = document.getElementById("button")

// 将自身状态同步到所有子复选框
checkbox.onclick = function () {
    add_SelectorAll.forEach(add => {
        add.checked = checkbox.checked;
    });
};

//定义函数：检查所有子复选框是否被选中，并更行全选复选框的状态
function updataSelectAll() {
    let allChecked = true;
    add_SelectorAll.forEach(add => {
        if (!add.checked) {
            allChecked = false;
        }
    });
    checkbox.checked = allChecked;
}

// 为每个子复选框绑定点击事件，当点击调用updataSelectAll
add_SelectorAll.forEach(add => {
    add.onclick = updataSelectAll
})

button.onclick = function () {
    add_SelectorAll.forEach(add => {
        add.checked = false;
    })
    checkbox.checked = false;
}