let ZJ = document.getElementById("ZJ")
			// 添加行范围
			ZJ.onclick = function () {
				// 名称
				let nameElemt = document.getElementById("name2")
				name2 = nameElemt.innerText 
				// 数量
				let numberElemt = document.getElementById("number2")
				number2 = numberElemt.innerText
				// 价格
				let numElemt = document.getElementById("num3")
				num3 = numElemt.innerText
				let tbody = document.getElementById("tbody")
				
				let newRow = document.createElement("tr")
				
				//创建第一个单元格
				let name = document.createElement("td")
				let text = document.createElement("div")
				text.innerText = name2
				name.appendChild(text)
				newRow.appendChild(name)
				
				//创建第二个
				let number = document.createElement("td")
				let num = document.createElement("div")
				num.innerText = number2
				number.appendChild(num)
				newRow.appendChild(number)
				
				//
				let price = document.createElement("td")
				let num2 = document.createElement("div")
				num2.innerText = num3
				price.appendChild(num2)
				newRow.appendChild(price)
				
				
				//
				let Del = document.createElement("td")
				let Delete = document.createElement("input")
				Delete.type = "button"
				Delete.value = "删除"
				Delete.onclick = function(){
					newRow.remove()
				}
				Del.appendChild(Delete)
				newRow.appendChild(Del)
				
				tbody.appendChild(newRow)
				nameElemt.innerText = ""
				numberElemt.innerText = ""
				numElemt.innerText = ""
				
				
			}