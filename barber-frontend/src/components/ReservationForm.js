import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
} from "@mui/material";

import ReCAPTCHA from "react-google-recaptcha";

const TIME_INTERVAL = 20;
const START_HOUR = 8;
const END_HOUR = 20;
const BREAK_START = "12:00";
const BREAK_END = "12:40";

function generateTimeSlots() {
  const slots = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    for (let m = 0; m < 60; m += TIME_INTERVAL) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (time >= BREAK_START && time < BREAK_END) continue;
      slots.push(time);
    }
  }
  return slots;
}
const ALL_TIME_SLOTS = generateTimeSlots();

const RECAPTCHA_SITE_KEY = "6Lelv4srAAAAACcrcg4YDlQtxRC_PXthdMRI5dUM"; // Nahraď tvojim site key

function ReservationForm({ isLoggedIn }) {
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    datum: "",
    cas: "",
  });

  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  const [reservedSlots, setReservedSlots] = useState({
    "2025-07-22": ["08:00", "08:20"],
    "2025-07-24": ["10:00", "10:20"],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const now = new Date();
  const nowISODate = now.toISOString().split("T")[0];
  const nowTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const getAvailableTimes = () => {
    if (!formData.datum) return [];
    const busyTimes = reservedSlots[formData.datum] || [];
    const isToday = formData.datum === nowISODate;
    return ALL_TIME_SLOTS.filter((time) => {
      if (busyTimes.includes(time)) return false;
      if (isToday && time <= nowTimeStr) return false;
      return true;
    });
  };

  const availableTimes = getAvailableTimes();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.meno.trim() ||
      !formData.email.trim() ||
      !formData.datum ||
      !formData.cas
    ) {
      setErrorMsg("Vyplň prosím všetky polia.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setErrorMsg("Zadaj platný email.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // Spusti reCAPTCHA a získaj token
      const recaptchaValue = await recaptchaRef.current.executeAsync();
      recaptchaRef.current.reset();

      const res = await fetch("http://localhost:5000/reservations", {
        method: "POST",
        credentials: "include", // dôležité, ak backend posiela cookie (client_id)
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.meno,
          email: formData.email,
          date: formData.datum,
          time: formData.cas,
          recaptcha_token: recaptchaValue, // posielame token na backend
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setFormData({ meno: "", email: "", datum: "", cas: "" });
        }, 3000);
      } else {
        setErrorMsg(result.message || "Chyba servera, skúste znova.");
      }
    } catch {
      setErrorMsg("Nepodarilo sa pripojiť k serveru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 6,
        mb: 6,
        bgcolor: "#f5f7fa",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          width: "100%",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          Rezervácia termínu
        </Typography>

        {!isLoggedIn && (
          <Box
            sx={{
              position: "fixed",
              bottom: 16,
              left: 16,
              zIndex: 1000,
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              component={Link}
              to="/login"
              sx={{
                animation: "pulse 2s infinite",
                borderRadius: "20px",
                paddingX: 3,
                paddingY: 1,
                boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
                backgroundColor: "white",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                  transform: "scale(1.05)",
                  transition: "0.3s",
                },
              }}
            >
              Prejsť na prihlásenie
            </Button>
          </Box>
        )}

        {isLoggedIn && (
          <Box sx={{ position: "absolute", top: 16, left: 16 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
            >
              Odhlásiť sa
            </Button>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Meno"
                name="meno"
                fullWidth
                value={formData.meno}
                onChange={handleChange}
                required
                autoFocus
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                required
                type="email"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dátum"
                name="datum"
                type="date"
                fullWidth
                value={formData.datum}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: nowISODate }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Čas"
                name="cas"
                select
                fullWidth
                value={formData.cas}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="" disabled>
                  Vyber čas
                </MenuItem>
                {ALL_TIME_SLOTS.map((time) => {
                  const disabled = !availableTimes.includes(time);
                  return (
                    <MenuItem
                      key={time}
                      value={time}
                      disabled={disabled}
                      sx={{ color: disabled ? "gray" : "inherit" }}
                    >
                      {time}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>
          </Grid>

          {errorMsg && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {errorMsg}
            </Alert>
          )}

          <Box sx={{ position: "relative", mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || success}
              fullWidth
              sx={{
                fontWeight: "bold",
                fontSize: "1.2rem",
                py: 1.5,
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(13, 71, 161, 0.3)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(13, 71, 161, 0.5)",
                },
              }}
            >
              {loading ? "Odosielam..." : "Odoslať rezerváciu"}
            </Button>
            {loading && (
              <CircularProgress
                size={28}
                sx={{
                  color: "primary.main",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-14px",
                  marginLeft: "-14px",
                }}
              />
            )}
          </Box>
        </Box>

        {success && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              bgcolor: "rgba(0,0,0,0.4)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1300,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                bgcolor: "success.main",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                animation: "scaleUp 0.5s ease forwards",
                boxShadow: 6,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                width="60px"
                height="60px"
              >
                <path d="M9 16.2l-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4z" />
              </svg>
            </Box>
            <style>{`
              @keyframes scaleUp {
                0% {
                  transform: scale(0);
                  opacity: 0;
                }
                100% {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            `}</style>
          </Box>
        )}

        {/* reCAPTCHA widget (invisible) */}
        <ReCAPTCHA
          sitekey={RECAPTCHA_SITE_KEY}
          size="invisible"
          ref={recaptchaRef}
        />
      </Paper>
    </Container>
  );
}

export default ReservationForm;
