function multiplication() {
    let nine = ""
    for (let i = 1; i <= 9; i++) {
        for (let j = 1; j <= i; j++) {
            nine += `${j} * ${i} = ${j * i}\t`
        }
        nine += "\n"
    }
    return nine
}

let textarea = document.querySelectorAll(".textarea_alone")
let textareas = multiplication()
textarea.forEach(span_nine =>{
    span_nine.value = textareas
})

