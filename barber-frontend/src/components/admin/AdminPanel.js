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
import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

function AdminPanel() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    </Container>
  );
}

export default AdminPanel;
