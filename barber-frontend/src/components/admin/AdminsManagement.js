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
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

function AdminsManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editAdminData, setEditAdminData] = useState(null);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAdmins = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:5000/admins", {
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
          throw new Error("Nepodarilo sa načítať adminov");
        }

        const data = await res.json();
        setAdmins(data);
      } catch (err) {
        setError(err.message || "Chyba pri načítaní adminov");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [navigate, token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Naozaj chcete vymazať tohto admina?")) return;

    try {
      const res = await fetch(`http://localhost:5000/admins/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Chyba pri vymazávaní admina");

      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message || "Chyba pri vymazávaní");
    }
  };

  const handleAddOpen = () => {
    setFormData({ username: "", password: "" });
    setOpenAdd(true);
  };

  const handleAddClose = () => {
    setOpenAdd(false);
  };

  const handleEditOpen = (admin) => {
    setEditAdminData(admin);
    setFormData({ username: admin.username, password: "" });
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setEditAdminData(null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSubmit = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      alert("Vyplňte používateľské meno a heslo");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Chyba pri pridávaní admina");
      }

      const newAdmin = await res.json();
      setAdmins((prev) => [...prev, newAdmin]);
      setOpenAdd(false);
    } catch (err) {
      alert(err.message || "Chyba pri pridávaní admina");
    }
  };

  const handleEditSubmit = async () => {
    if (!formData.username.trim()) {
      alert("Používateľské meno nesmie byť prázdne");
      return;
    }
    // heslo môže byť prázdne - znamená nemeniť

    try {
      const res = await fetch(`http://localhost:5000/admins/${editAdminData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Chyba pri aktualizácii admina");
      }

      const updatedAdmin = await res.json();

      setAdmins((prev) =>
        prev.map((a) => (a.id === updatedAdmin.id ? updatedAdmin : a))
      );
      setOpenEdit(false);
      setEditAdminData(null);
    } catch (err) {
      alert(err.message || "Chyba pri aktualizácii admina");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Správa Adminov
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={handleAddOpen}>
        Pridať Admina
      </Button>

      {loading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && admins.length === 0 && (
        <Typography>Žiadni admini.</Typography>
      )}

      {!loading && !error && admins.length > 0 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell align="center">Akcie</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map(({ id, username }) => (
                <TableRow key={id}>
                  <TableCell>{username}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditOpen({ id, username })}
                      aria-label="Upraviť"
                    >
                      <EditIcon />
                    </IconButton>
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

      {/* Dialog Pridať Admina */}
      <Dialog open={openAdd} onClose={handleAddClose}>
        <DialogTitle>Pridať Admina</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Používateľské meno"
            type="text"
            fullWidth
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Heslo"
            type="password"
            fullWidth
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Zrušiť</Button>
          <Button onClick={handleAddSubmit} variant="contained">
            Pridať
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Upraviť Admina */}
      <Dialog open={openEdit} onClose={handleEditClose}>
        <DialogTitle>Upraviť Admina</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Používateľské meno"
            type="text"
            fullWidth
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Heslo (nepovinné)"
            type="password"
            fullWidth
            name="password"
            value={formData.password}
            onChange={handleChange}
            helperText="Nechajte prázdne, ak nechcete meniť heslo"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Zrušiť</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Uložiť
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminsManagement;
