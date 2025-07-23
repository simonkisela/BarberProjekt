from barber_backend.db import SessionLocal
from barber_backend.models import Admin
from werkzeug.security import generate_password_hash

# Vytvorenie admina
db = SessionLocal()

username = "admin"
password = "admin123"

hashed_password = generate_password_hash(password)

new_admin = Admin(username=username, password=hashed_password)

db.add(new_admin)
db.commit()
db.close()

print("✅ Admin vytvorený.")
