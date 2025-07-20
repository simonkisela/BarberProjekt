from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Načítanie DATABASE_URL z prostredia (Render)
DATABASE_URL = os.getenv(
    'postgresql://barber_user_user:yhjjZX3EmkYByIKP7RhDvLvVw7j6puZN@dpg-d1ubo9er433s73ej0mpg-a.frankfurt-postgres.render.com/barber_user')

# Pre SQLAlchemy
engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Základ pre modely
Base = declarative_base()
