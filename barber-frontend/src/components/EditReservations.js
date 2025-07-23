import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Rezervácia nenájdená");
        const data = await res.json();
        setForm({
          name: data.name,
          email: data.email,
          date: data.date.split("T")[0], // pre dátum typu ISO string
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

      onUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Typography>Načítavam rezerváciu...</Typography>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && <Typography color="error">{error}</Typography>}

      <TextField
        label="Meno"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
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

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Uložiť zmeny
      </Button>
      <Button onClick={onClose} sx={{ mt: 1, ml: 2 }}>
        Zrušiť
      </Button>
    </Box>
  );
}

export default EditReservation;
