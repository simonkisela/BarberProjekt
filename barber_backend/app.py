from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from barber_backend.models import init_db

app = Flask(__name__)
CORS(app)

init_db()

# Koreňová route pre Render kontrolu
@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "BarberProjekt backend beží úspešne!"})

@app.route("/reservations", methods=["GET"])
def get_reservations():
    conn = sqlite3.connect('db.sqlite3')
    c = conn.cursor()
    c.execute("SELECT * FROM reservations")
    rows = c.fetchall()
    conn.close()
    return jsonify(rows)

@app.route("/reservations", methods=["POST"])
def create_reservation():
    data = request.json
    conn = sqlite3.connect('db.sqlite3')
    c = conn.cursor()
    c.execute("INSERT INTO reservations (name, email, date, time) VALUES (?, ?, ?, ?)",
              (data['name'], data['email'], data['date'], data['time']))
    conn.commit()
    conn.close()
    return jsonify({"message": "Reservation created"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    conn = sqlite3.connect('db.sqlite3')
    c = conn.cursor()
    c.execute("SELECT * FROM admin WHERE username=? AND password=?", (data["username"], data["password"]))
    admin = c.fetchone()
    conn.close()
    if admin:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Unauthorized"}), 401

if __name__ == "__main__":
    app.run(debug=True)
