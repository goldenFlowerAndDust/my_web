X = int(input("X="))
Y = int(input("Y="))

for i in range(X):
    for j in range(Y):
        if i == 0 and j == 0 or i == X - 1 and j == 0 or j == Y - 1  and i == 0 or i == X - 1  and j == Y - 1:
            print("#", end="")
        elif i == 0 or i == X - 1:
            print("%", end="")
        elif j == 0 or j == Y - 1 :
            print("@", end="")
        else:
            print(" ", end="")
    print("")
