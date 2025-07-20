from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Načítanie DATABASE_URL z prostredia (Render)
DATABASE_URL = os.getenv("DATABASE_URL")

# Pre SQLAlchemy
engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Základ pre modely
Base = declarative_base()
