def calc(*args: int) -> float:
    return sum(args) / len(args)


print(calc(50, 11, 30, 60, 70))


def student(**kwargs: int) -> tuple[list[str], list[int]]:
    names = list(kwargs.keys())
    scores = list(kwargs.values())
    return names, scores


name,score = student(**{'a': 50, 'b': 60, '大名': 'k'})
for name, score in zip(name, score):
    print(name, score)
