import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


def send_reservation_email(to_email, name, date, time):
    subject = "Potvrdenie rezervácie"
    body = f"""
    Dobrý deň {name},

    Vaša rezervácia bola úspešne vytvorená na dátum: {date}, čas: {time}.

    Ďakujeme, že ste si vybrali náš barber shop!
    """

    msg = MIMEMultipart()
    msg["From"] = EMAIL_USERNAME
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"E-mail odoslaný na {to_email}")
    except Exception as e:
        print(f"Chyba pri odosielaní e-mailu: {e}")
