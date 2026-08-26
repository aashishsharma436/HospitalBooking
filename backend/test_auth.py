from auth import get_password_hash, verify_password


password = "123456"

hashed_password = get_password_hash(password)

print("Hashed Password:")
print(hashed_password)


print("Password Match:")
print(verify_password(password, hashed_password))
