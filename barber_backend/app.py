from flask import Flask, request, jsonify
from flask_cors import CORS
from barber_backend.db import SessionLocal, engine, Base
from barber_backend.models import Reservation, Admin
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
from barber_backend.schemas import ReservationSchema, AdminRegisterSchema
from marshmallow import ValidationError

# Tajný kľúč pre podpisovanie tokenov
SECRET_KEY = "supertajnykluc_na_tokeny"  # v produkcii použi silnejší a v .env


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].replace("Bearer ", "")

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data["username"]
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401

        return f(current_user, *args, **kwargs)

    return decorated


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
    schema = AdminRegisterSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    db = SessionLocal()
    existing_admin = db.query(Admin).filter_by(username=validated_data["username"]).first()
    if existing_admin:
        db.close()
        return jsonify({"message": "Admin already exists"}), 409

    hashed_password = generate_password_hash(validated_data["password"])
    new_admin = Admin(username=validated_data["username"], password=hashed_password)
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    db.close()
    return jsonify({"message": "Admin registered"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    db = SessionLocal()

    admin = db.query(Admin).filter_by(username=data["username"]).first()
    db.close()

    if admin and check_password_hash(admin.password, data["password"]):
        token = jwt.encode({
            "username": admin.username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({"token": token}), 200

    return jsonify({"message": "Unauthorized"}), 401


@app.route("/reservations", methods=["GET"])
@token_required
def get_reservations(current_user):
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
@token_required
def create_reservation(current_user):
    data = request.json
    schema = ReservationSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    db = SessionLocal()
    reservation = Reservation(**validated_data)
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    db.close()
    return jsonify({"message": "Reservation created"}), 201

@app.route("/admins", methods=["GET"])
@token_required
def get_admins(current_user):
    db = SessionLocal()
    admins = db.query(Admin).all()
    db.close()
    return jsonify([{"id": a.id, "username": a.username} for a in admins])


@app.route("/admins/<int:admin_id>", methods=["DELETE"])
@token_required
def delete_admin(current_user, admin_id):
    db = SessionLocal()
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        db.close()
        return jsonify({"message": "Admin not found"}), 404

    db.delete(admin)
    db.commit()
    db.close()
    return jsonify({"message": "Admin deleted"})


if __name__ == "__main__":
    app.run(debug=True)
