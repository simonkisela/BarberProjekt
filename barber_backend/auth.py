import jwt
from functools import wraps
from flask import request, jsonify
import datetime

SECRET_KEY = "tvoj_secret_key"  # rovnaký ako v app.py

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Token by mal prísť v Authorization header ako "Bearer <token>"
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            # Tu môžeš napríklad načítať admina podľa data['username'] ak chceš
            # admin = db.query(Admin).filter_by(username=data['username']).first()
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token. Please log in again."}), 401

        return f(*args, **kwargs)

    return decorated
