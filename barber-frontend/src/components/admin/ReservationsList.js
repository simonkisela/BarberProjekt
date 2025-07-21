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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";

function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/reservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // Token expired or invalid
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

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Zoznam rezervácií
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchReservations}
        >
          Obnoviť
        </Button>
      </Box>

      {loading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && reservations.length === 0 && (
        <Typography>Žiadne rezervácie.</Typography>
      )}

      {!loading && !error && reservations.length > 0 && (
        <Paper>
          <Table>
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
                <TableRow key={id}>
                  <TableCell>{name}</TableCell>
                  <TableCell>{email}</TableCell>
                  <TableCell>{new Date(date).toLocaleDateString()}</TableCell>
                  <TableCell>{time}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(id)}
                      aria-label="Vymazať"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}

export default ReservationsList;
