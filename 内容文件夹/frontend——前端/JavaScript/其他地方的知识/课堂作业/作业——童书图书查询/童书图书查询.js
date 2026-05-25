// 排列书
const book = [{
    id: 1,
    name: '少年读史记',
    price: 50
},
    {
        id: 2,
        name: '神奇校车',
        price: 99
    },
    {
        id: 3,
        name: '画给孩子的中国历史',
        price: 40
    },
    {
        id: 4,
        name: '少年读山海经',
        price: 50
    },
    {
        id: 5,
        name: '铃木绘本系列宫西达',
        price: 22.5
    },
    {
        id: 6,
        name: '皮特猫',
        price: 69.9
    },
    {
        id: 7,
        name: '窗边的小豆豆',
        price: 39.5
    },
    {
        id: 8,
        name: '东野圭吾：我的老师是侦探',
        price: 42
    },
    {
        id: 9,
        name: '万物由来科学绘本',
        price: 50
    },
    {
        id: 10,
        name: '夏洛的网',
        price: 37
    },
]

function renderTable(books) {
    const container = document.getElementById("tbody");
    container.innerHTML = ""

    // 创建表结构
    const table = document.createElement(`table`)

    const thead = document.createElement(`thead`)
    thead.innerHTML = `<tr><th>序号</th><th>书名</th><th>价格</th></tr>`
    table.appendChild(thead)

    const tbody = document.createElement("tbody");
    books.forEach((book) => {
        const row = document.createElement("tr");
        row.innerHTML += `<td>${book.id}</td><td>${book.name}</td><td>${book.price}</td>`
        tbody.appendChild(row)
    })
    table.appendChild(tbody)
    container.appendChild(table)
    table.style.textAlign = "center"

}

renderTable(book)

// 价格查询

document.querySelector('#price').onclick = function () {
    const minPrice = document.getElementById('minPrice')
    const maxPrice = document.getElementById('maxPrice')

    const min = parseFloat(minPrice.value)
    const max = parseFloat(maxPrice.value)
    if (isNaN(min) || isNaN(max)) {
        alert('请输出数字！！！')
        renderTable(book)
        minPrice.value = ''
        maxPrice.value = ''
        return
    }

    const Filtered = book.filter((price) => {
        return price.price >= min && price.price <= max
    })
    renderTable(Filtered)
    minPrice.value = ''
    maxPrice.value = ''
}

// 书本查询
document.getElementById('book').onclick = function () {
    let keyWord = document.getElementById('keyWord');
    let key = keyWord.value.trim()
    if (!key) {
        renderTable(book)
        return
    }
    const filtered = book.filter((value) => {
        return value.name.includes(key)
    })
    renderTable(filtered)
    keyWord.value= ''
}
