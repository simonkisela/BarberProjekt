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

from auth import token_required
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

@app.route("/admins/<int:admin_id>/reset-password", methods=["POST"])
@token_required
def reset_password(current_user, admin_id):
    data = request.json
    new_password = data.get("password", "").strip()

    if not new_password:
        return jsonify({"msg": "Nové heslo je povinné"}), 400

    db = SessionLocal()
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        db.close()
        return jsonify({"msg": "Admin nenájdený"}), 404

    # Tu môžeš pridať overenie rolí podľa current_user, napr.:
    # if current_user != 'superadmin':
    #    return jsonify({"msg": "Nemáš právo resetovať heslá"}), 403

    admin.password = generate_password_hash(new_password)
    db.commit()
    db.close()

    return jsonify({"msg": "Heslo úspešne resetované"}), 200



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



@app.route("/")
def home():
    return "BarberProjekt API beží 🎉"

@app.route('/admin/data', methods=['GET'])
@token_required
def admin_data():
    # Táto route je chránená tokenom
    return jsonify({"message": "Toto je admin panel."})

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
    result = [
        {
            "id": r.id,
            "name": r.name,
            "email": r.email,
            "date": r.date.isoformat(),
            "time": r.time,
        }
        for r in reservations
    ]
    return jsonify(result)

@app.route("/reservations/<int:reservation_id>", methods=["GET"])
@token_required
def get_reservation(current_user, reservation_id):
    db = SessionLocal()
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    db.close()
    if not reservation:
        return jsonify({"message": "Reservation not found"}), 404
    return jsonify({
        "id": reservation.id,
        "name": reservation.name,
        "email": reservation.email,
        "date": reservation.date.isoformat(),
        "time": reservation.time,
    })

@app.route("/reservations/<int:reservation_id>", methods=["PUT"])
@token_required
def update_reservation(current_user, reservation_id):
    data = request.json
    schema = ReservationSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    db = SessionLocal()
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        db.close()
        return jsonify({"message": "Reservation not found"}), 404

    reservation.name = validated_data["name"]
    reservation.email = validated_data["email"]
    reservation.date = validated_data["date"]
    reservation.time = validated_data["time"]

    db.commit()
    db.refresh(reservation)
    db.close()
    return jsonify({
        "id": reservation.id,
        "name": reservation.name,
        "email": reservation.email,
        "date": reservation.date.isoformat(),
        "time": reservation.time,
    })

@app.route("/reservations/<int:reservation_id>", methods=["DELETE"])
@token_required
def delete_reservation(current_user, reservation_id):
    db = SessionLocal()
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        db.close()
        return jsonify({"message": "Reservation not found"}), 404

    db.delete(reservation)
    db.commit()
    db.close()
    return jsonify({"message": "Reservation deleted"})


@app.route("/admins/<int:admin_id>", methods=["PUT"])
@token_required
def update_admin(current_user, admin_id):
    data = request.json
    db = SessionLocal()
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        db.close()
        return jsonify({"message": "Admin not found"}), 404

    if "username" in data and data["username"].strip():
        admin.username = data["username"]

    if "password" in data and data["password"].strip():
        admin.password = generate_password_hash(data["password"])

    db.commit()
    db.refresh(admin)
    db.close()
    return jsonify({"id": admin.id, "username": admin.username})


from email_utils import send_reservation_email

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

    # Over, či už niekto nemá rovnaký čas (voliteľné)
    exists = db.query(Reservation).filter_by(date=validated_data["date"], time=validated_data["time"]).first()
    if exists:
        db.close()
        return jsonify({"message": "Termín už je obsadený"}), 409

    reservation = Reservation(**validated_data)
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    db.close()

    # Poslať e-mail
    send_reservation_email(
        to_email=validated_data["email"],
        name=validated_data["name"],
        date=validated_data["date"],
        time=validated_data["time"]
    )

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

# -------------------- ZÁKAZNÍCKE FUNKCIE --------------------

# 1. Rezervácia bez loginu (bez token_required)
@app.route("/public/reservations", methods=["POST"])
def public_create_reservation():
    data = request.json
    schema = ReservationSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    db = SessionLocal()

    # Overenie dostupnosti termínu
    existing = db.query(Reservation).filter(
        Reservation.date == validated_data["date"],
        Reservation.time == validated_data["time"]
    ).first()

    if existing:
        db.close()
        return jsonify({"message": "Termín je už obsadený"}), 409

    reservation = Reservation(**validated_data)
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    db.close()

    return jsonify({"message": "Rezervácia bola úspešná"}), 201


# 2. Overenie dostupnosti pre daný dátum a čas
@app.route("/check-availability", methods=["POST"])
def check_availability():
    data = request.json
    date = data.get("date")
    time = data.get("time")

    if not date or not time:
        return jsonify({"message": "Chýba dátum alebo čas"}), 400

    db = SessionLocal()
    exists = db.query(Reservation).filter_by(date=date, time=time).first()
    db.close()

    if exists:
        return jsonify({"available": False, "message": "Termín je už obsadený"}), 200

    return jsonify({"available": True, "message": "Termín je voľný"}), 200

# 3. Vráti všetky obsadené termíny (na frontend kalendár)
@app.route("/reserved-times", methods=["GET"])
def reserved_times():
    db = SessionLocal()
    reservations = db.query(Reservation).all()
    db.close()

    result = [
        {
            "date": r.date.isoformat(),
            "time": r.time
        }
        for r in reservations
    ]
    return jsonify(result)


from flask import request, jsonify
import requests
import uuid
from marshmallow import ValidationError

MAX_RESERVATIONS_PER_SLOT = 5
RECAPTCHA_SECRET_KEY = "6Lelv4srAAAAAO_ricBKPv4TH8GdWA-2qq4Q8aQk"

@app.route("/reservations", methods=["POST"])
def create_reservation_public():
    data = request.json
    schema = ReservationSchema()

    # 1. Overenie reCaptcha tokenu
    recaptcha_token = data.get("recaptcha_token")
    if not recaptcha_token:
        return jsonify({"message": "Chýba reCaptcha token"}), 400

    recaptcha_response = requests.post(
        "https://www.google.com/recaptcha/api/siteverify",
        data={
            "secret": RECAPTCHA_SECRET_KEY,
            "response": recaptcha_token
        }
    ).json()

    if not recaptcha_response.get("success"):
        return jsonify({"message": "Neúspešné overenie reCaptcha"}), 400

    # 2. Validácia dát
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    db = SessionLocal()

    # 3. Kontrola počtu rezervácií na daný slot (date + time)
    count_slot = db.query(Reservation).filter(
        Reservation.date == validated_data["date"],
        Reservation.time == validated_data["time"]
    ).count()
    if count_slot >= MAX_RESERVATIONS_PER_SLOT:
        db.close()
        return jsonify({"message": "Tento časový slot je už plný."}), 400

    # 4. Získanie IP adresy
    user_ip = request.remote_addr

    # 5. Kontrola, či už neexistuje rezervácia z tej istej IP na daný deň
    existing_ip_reservation = db.query(Reservation).filter(
        Reservation.ip_address == user_ip,
        Reservation.date == validated_data["date"]
    ).first()
    if existing_ip_reservation:
        db.close()
        return jsonify({"message": "Z jednej IP adresy môžeš vytvoriť len jednu rezerváciu denne."}), 400

    # 6. Kontrola client_id v cookie
    client_id = request.cookies.get("client_id")
    if client_id:
        existing_client_reservation = db.query(Reservation).filter(
            Reservation.client_id == client_id,
            Reservation.date == validated_data["date"]
        ).first()
        if existing_client_reservation:
            db.close()
            return jsonify({"message": "Z jedného zariadenia môžeš vytvoriť len jednu rezerváciu denne."}), 400
    else:
        # Generujeme nový client_id, ak neexistuje cookie
        client_id = str(uuid.uuid4())

    # 7. Vytvorenie rezervácie a uloženie ip_address + client_id
    reservation = Reservation(**validated_data)
    reservation.ip_address = user_ip
    reservation.client_id = client_id

    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    db.close()

    # 8. Poslať client_id v cookie ak nový
    response = jsonify({"message": "Rezervácia bola úspešne vytvorená."})
    response.set_cookie("client_id", client_id, max_age=60*60*24*365)  # 1 rok

    return response


if __name__ == "__main__":
    app.run(debug=True)
