from marshmallow import Schema, fields, validate, ValidationError
import datetime

def must_not_be_blank(data):
    if not data or data.strip() == "":
        raise ValidationError("Field cannot be blank.")

def validate_date(value):
    try:
        datetime.datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise ValidationError("Date must be in YYYY-MM-DD format.")

def validate_time(value):
    try:
        datetime.datetime.strptime(value, "%H:%M")
    except ValueError:
        raise ValidationError("Time must be in HH:MM format.")

class ReservationSchema(Schema):
    name = fields.Str(required=True, validate=must_not_be_blank)
    email = fields.Email(required=True)
    date = fields.Str(required=True, validate=validate_date)
    time = fields.Str(required=True, validate=validate_time)

class AdminRegisterSchema(Schema):
    username = fields.Str(required=True, validate=must_not_be_blank)
    password = fields.Str(required=True, validate=validate.Length(min=6))
