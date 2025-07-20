from barber_backend.models import SessionLocal, Admin

def create_admin(username: str, password: str):
    db = SessionLocal()
    existing_admin = db.query(Admin).filter_by(username=username).first()
    if existing_admin:
        print(f"Admin '{username}' už existuje.")
        db.close()
        return
    new_admin = Admin(username=username, password=password)
    db.add(new_admin)
    db.commit()
    db.close()
    print(f"Admin '{username}' vytvorený.")

if __name__ == "__main__":
    # Zadaj meno a heslo admina, ktoré chceš vytvoriť
    create_admin("admin", "heslo123")
