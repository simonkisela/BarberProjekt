from flask import Flask, request, jsonify
from flask_cors import CORS
from barber_backend.db import SessionLocal, engine, Base
from barber_backend.models import Reservation, Admin

# Vytvorenie tabuliek v databáze
Base.metadata.create_all(bind=engine)

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "BarberProjekt API beží 🎉"

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    db = SessionLocal()

    # Skontroluj, či už meno existuje
    existing_admin = db.query(Admin).filter_by(username=data["username"]).first()
    if existing_admin:
        db.close()
        return jsonify({"message": "Admin already exists"}), 409

    # Vytvor nového admina
    new_admin = Admin(username=data["username"], password=data["password"])
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    db.close()
    return jsonify({"message": "Admin registered"}), 201


@app.route("/reservations", methods=["GET"])
def get_reservations():
    db = SessionLocal()
    reservations = db.query(Reservation).all()
    db.close()
    return jsonify([{
        "id": r.id,
        "name": r.name,
        "email": r.email,
        "date": r.date,
        "time": r.time
    } for r in reservations])

@app.route("/reservations", methods=["POST"])
def create_reservation():
    data = request.json
    db = SessionLocal()
    reservation = Reservation(**data)
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    db.close()
    return jsonify({"message": "Reservation created"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    db = SessionLocal()
    admin = db.query(Admin).filter_by(username=data["username"], password=data["password"]).first()
    db.close()
    if admin:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Unauthorized"}), 401

if __name__ == "__main__":
    app.run(debug=True)
