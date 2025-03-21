from time import sleep as s
import random
import string


print('Python Received: Starting Server!')
# for i in range(20):
#     print(''
#           .join(
#               random.choices(
#                   string.ascii_uppercase + string.digits,
#                   k=random.randint(1, 15))))
#     s(1)

# print('Python Received: Done')
while True:
    print("Python Received: " + str(input()))
    s(0.1)
