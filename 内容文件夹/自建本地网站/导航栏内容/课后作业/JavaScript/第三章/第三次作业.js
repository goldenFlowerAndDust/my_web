var timer;

function startScroll() {
    clearTimeout(timer);

    var num = Math.floor(Math.random() * 10);

    var student = [
        {name: "张三", id: "1"},
        {name: "张四", id: "2"},
        {name: "张五", id: "3"},
        {name: "张六", id: "4"},
        {name: "张七", id: "5"},
        {name: "张八", id: "6"},
        {name: "张九", id: "7"},
        {name: "李四", id: "8"},
        {name: "李五", id: "9"},
        {name: "李六", id: "10"},
        {name: "李七", id: "11"},
        {name: "李八", id: "12"},
        {name: "李九", id: "13"},
        {name: "李四", id: "14"},
        {name: "王五", id: "15"},
        {name: "王六", id: "16"},
        {name: "王七", id: "17"},
        {name: "王八", id: "18"},
        {name: "王九", id: "19"},
    ];
    document.querySelector("#studentNum").innerHTML = student[num].id;
    document.querySelector("#studentName").innerHTML = student[num].name;

    timer = setTimeout("startScroll()", 10);
}

function stopScroll() {
    clearTimeout(timer);
}