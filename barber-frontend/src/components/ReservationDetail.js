import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Snackbar,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function ReservationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
  });

  const token = localStorage.getItem("token");

  // Načítanie detailu rezervácie
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchReservation = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:5000/reservations/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Nepodarilo sa načítať rezerváciu");
        }

        const data = await res.json();
        setReservation(data);
        setFormData({
          name: data.name,
          email: data.email,
          date: data.date,
          time: data.time,
        });
      } catch (err) {
        setError(err.message || "Chyba pri načítaní dát");
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id, navigate, token]);

  // Validácia formulára
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Meno je povinné.");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email je povinný.");
      return false;
    }
    // Jednoduchá kontrola emailu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Neplatný formát emailu.");
      return false;
    }
    if (!formData.date) {
      setError("Dátum je povinný.");
      return false;
    }
    if (!formData.time.trim()) {
      setError("Čas je povinný.");
      return false;
    }
    setError("");
    return true;
  };

  // Uloženie úprav
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/reservations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Chyba pri aktualizácii rezervácie");
      }

      const updated = await res.json();
      setReservation(updated);
      setEditMode(false);
      setSuccessMsg("Rezervácia bola úspešne uložená.");
    } catch (err) {
      setError(err.message || "Chyba pri ukladaní zmien");
    } finally {
      setLoading(false);
    }
  };

  // Vymazanie rezervácie
  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/reservations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Chyba pri vymazávaní rezervácie");

      setSuccessMsg("Rezervácia bola vymazaná.");
      setTimeout(() => navigate("/admin/reservations"), 1500);
    } catch (err) {
      setError(err.message || "Chyba pri vymazávaní");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setError("");
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !editMode) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!reservation) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Typography variant="h6" align="center">
          Rezervácia nebola nájdená.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4, position: "relative" }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Detail rezervácie
        </Typography>

        {/* Snackbar pre úspechy */}
        <Snackbar
          open={!!successMsg}
          autoHideDuration={3000}
          onClose={() => setSuccessMsg("")}
          message={successMsg}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />

        {/* Snackbar pre chyby */}
        <Snackbar
          open={!!error && editMode}
          autoHideDuration={5000}
          onClose={() => setError("")}
          message={error}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          severity="error"
        />

        <AnimatePresence mode="wait">
          {!editMode ? (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Typography>
                <strong>Meno:</strong> {reservation.name}
              </Typography>
              <Typography>
                <strong>Email:</strong> {reservation.email}
              </Typography>
              <Typography>
                <strong>Dátum:</strong>{" "}
                {new Date(reservation.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Typography>
              <Typography>
                <strong>Čas:</strong> {reservation.time}
              </Typography>

              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button variant="contained" onClick={handleEditToggle}>
                  Upraviť
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  Vymazať
                </Button>
                <Button
                  variant="text"
                  onClick={() => navigate("/admin/reservations")}
                >
                  Späť
                </Button>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TextField
                label="Meno"
                name="name"
                fullWidth
                margin="normal"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                label="Dátum"
                name="date"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                label="Čas"
                name="time"
                fullWidth
                margin="normal"
                value={formData.time}
                onChange={handleChange}
                disabled={loading}
              />

              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                >
                  Uložiť
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleEditToggle}
                  disabled={loading}
                >
                  Zrušiť
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialog pre potvrdenie vymazania */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Potvrdenie vymazania</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Naozaj chcete vymazať túto rezerváciu? Táto akcia je nezvratná.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Zrušiť</Button>
            <Button color="error" onClick={handleDelete}>
              Vymazať
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}

export default ReservationDetail;
