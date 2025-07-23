from sqlalchemy import Column, Integer, String
from barber_backend.db import Base

# Tabuľka rezervácií (pre zákazníkov)
class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)    # voliteľné: na sledovanie IP klienta
    client_id = Column(String, nullable=True)     # voliteľné: na sledovanie podľa cookies

# Tabuľka adminov (na prihlásenie do administrácie)
class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # uložené hashované heslo (nie čisté)
