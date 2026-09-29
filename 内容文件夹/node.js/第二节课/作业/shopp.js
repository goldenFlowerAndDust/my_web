let moments = require('moment')
moments.locale('zh-cn')
let price = require('./price.js')
let dada = [
	{
		"name":'苹果',
		"price":18,
		'quantity':20,
		"data":'20200-10-08'
	},
	{
		"name":'香蕉',
		"price":30,
		'quantity':40,
		"data":'20230-10-08'
	},
	{
		"name":'西瓜',
		"price":100,
		'quantity':15.5,
		"data":'2020-10-08'
	}
]

for(let i of dada){
	let tiem = moments(i.data,'Y-M-D').format('Y年M月D日')
	let sumprices = price.sumprice(i.price,i.quantity)
	console.log(`${sumprices}元,购买时间：${tiem}`)
}