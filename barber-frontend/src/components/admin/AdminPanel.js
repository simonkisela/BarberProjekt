import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Box,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

// -----------------------
// EditReservation komponent
// -----------------------
function EditReservation({ reservationId, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchReservation() {
      try {
        const res = await fetch(`http://localhost:5000/reservations/${reservationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Rezervácia nenájdená");
        const data = await res.json();
        setForm({
          name: data.name,
          email: data.email,
          date: data.date.split("T")[0], // len dátum, odstránime čas z ISO stringu
          time: data.time,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReservation();
  }, [reservationId, token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/reservations/${reservationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Chyba pri ukladaní zmien");
      }
      onUpdated(); // refresh zoznamu v rodičovi
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Upraviť rezerváciu</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress />
            <Typography mt={2}>Načítavam rezerváciu...</Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label="Meno"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              autoFocus
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Dátum"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Čas"
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Zrušiť
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          Uložiť zmeny
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// -----------------------
// Hlavný AdminPanel komponent
// -----------------------
function AdminPanel() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null); // id rezervácie na edit

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchReservations = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/reservations", {
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
          throw new Error("Nepodarilo sa načítať rezervácie");
        }

        const data = await res.json();
        setReservations(data);
      } catch (err) {
        setError(err.message || "Chyba pri načítaní dát");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [navigate, token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Naozaj chcete vymazať túto rezerváciu?")) return;

    try {
      const res = await fetch(`http://localhost:5000/reservations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Chyba pri vymazávaní rezervácie");

      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message || "Chyba pri vymazávaní");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Po úspešnom editovaní načítame rezervácie znova
  const handleUpdated = () => {
    // Môžeme zavolať fetch znovu alebo refetchovať inak
    setLoading(true);
    fetch("http://localhost:5000/reservations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nepodarilo sa načítať rezervácie");
        return res.json();
      })
      .then((data) => {
        setReservations(data);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Chyba pri načítaní dát");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          Admin Panel - Rezervácie
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            boxShadow: "0 4px 8px rgba(255, 72, 66, 0.6)",
            "&:hover": {
              boxShadow: "0 6px 14px rgba(255, 72, 66, 0.8)",
              backgroundColor: "#b00020",
            },
          }}
        >
          Odhlásiť sa
        </Button>
      </Box>

      {loading && (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <CircularProgress size={48} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && reservations.length === 0 && (
        <Typography
          variant="h6"
          color="text.secondary"
          align="center"
          sx={{ mt: 4 }}
        >
          Žiadne rezervácie.
        </Typography>
      )}

      <AnimatePresence>
        {!loading && !error && reservations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={8}
              sx={{
                overflowX: "auto",
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <Table
                sx={{
                  minWidth: 650,
                  "& th": {
                    bgcolor: "primary.main",
                    color: "white",
                    fontWeight: "bold",
                  },
                  "& td, & th": { paddingY: 1.5 },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Meno</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Dátum</TableCell>
                    <TableCell>Čas</TableCell>
                    <TableCell align="center">Akcie</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map(({ id, name, email, date, time }) => (
                    <TableRow
                      key={id}
                      component={motion.tr}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      sx={{ cursor: "default" }}
                    >
                      <TableCell>{name}</TableCell>
                      <TableCell>{email}</TableCell>
                      <TableCell>
                        {new Date(date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{time}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => setEditId(id)}
                          aria-label="Editovať"
                          sx={{
                            mr: 1,
                            transition: "transform 0.2s ease",
                            "&:hover": { transform: "scale(1.2)" },
                          }}
                        >
                          <EditIcon fontSize="medium" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(id)}
                          aria-label="Vymazať"
                          sx={{
                            transition: "transform 0.2s ease",
                            "&:hover": { transform: "scale(1.2)" },
                          }}
                        >
                          <DeleteIcon fontSize="medium" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modálne okno pre editáciu */}
      {editId && (
        <EditReservation
          reservationId={editId}
          onClose={() => setEditId(null)}
          onUpdated={handleUpdated}
        />
      )}
    </Container>
  );
}

export default AdminPanel;
