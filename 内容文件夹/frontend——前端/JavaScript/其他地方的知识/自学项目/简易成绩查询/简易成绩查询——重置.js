const clearBtn = document.getElementById("clear")
if (clearBtn)
    clearBtn.onclick = function () {
        document.getElementById("score").innerHTML = ""
        document.getElementById("scoreResult").innerHTML = ""
        document.querySelectorAll("#inputRow .oper").forEach(cell => cell.innerHTML = '');
        students = []
        alert("已清除所有数据")
    }