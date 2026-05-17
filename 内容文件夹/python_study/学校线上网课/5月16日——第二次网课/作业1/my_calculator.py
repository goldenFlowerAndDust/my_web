from multiprocessing import Array


def add(Array):
    if not Array: return 0
    add2 = Array[0]
    for num in Array[1:]:
        add2 += num
    return add2


def subtract(Array):
    if not Array: return 0
    subtract2 = Array[0]
    for num in Array[1:]:
        subtract2 -= num
    return subtract2


def multiply(Array):
    if not Array: return 0
    multiply2 = Array[0]
    for num in Array[1:]:
        multiply2 *= num
    return multiply2


def divide(Array):
    if not Array:
        return 0
    divide2 = Array[0]
    for num in Array[1:]:
        divide2 /= num
    return divide2
