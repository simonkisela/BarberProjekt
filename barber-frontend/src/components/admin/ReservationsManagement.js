import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

function ReservationsManagement() {
  const [reservations, setReservations] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();

  // Po načítaní komponentu
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Ak token neexistuje, presmeruj na login
    } else {
      fetchReservations(token);
    }
  }, []);

  // Načítaj rezervácie z backendu
  const fetchReservations = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/reservations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login'); // Ak token je neplatný, presmeruj
        return;
      }

      const data = await res.json();
      setReservations(data);
    } catch (err) {
      console.error('Chyba pri načítaní rezervácií:', err);
    }
  };

  // Otvorenie modalu na editovanie
  const handleEditOpen = (reservation) => {
    setEditData(reservation);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditData(null);
  };

  const handleEditChange = (e) => {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Odoslanie úpravy rezervácie
  const handleEditSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/reservations/${editData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!res.ok) throw new Error('Chyba pri úprave');

      const updated = await res.json();
      setReservations(prev =>
        prev.map(r => (r.id === updated.id ? updated : r))
      );
      handleEditClose();
    } catch (err) {
      alert('Nepodarilo sa upraviť rezerváciu.');
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Správa rezervácií
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Meno</TableCell>
            <TableCell>Dátum</TableCell>
            <TableCell>Čas</TableCell>
            <TableCell>Akcie</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservations.map((res) => (
            <TableRow key={res.id}>
              <TableCell>{res.name}</TableCell>
              <TableCell>{res.date}</TableCell>
              <TableCell>{res.time}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEditOpen(res)} color="primary">
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal na úpravu rezervácie */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Upraviť rezerváciu</DialogTitle>
        <DialogContent>
          <TextField
            label="Meno"
            name="name"
            fullWidth
            margin="dense"
            value={editData?.name || ''}
            onChange={handleEditChange}
          />
          <TextField
            label="Dátum"
            name="date"
            type="date"
            fullWidth
            margin="dense"
            value={editData?.date || ''}
            onChange={handleEditChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Čas"
            name="time"
            type="time"
            fullWidth
            margin="dense"
            value={editData?.time || ''}
            onChange={handleEditChange}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Zrušiť</Button>
          <Button variant="contained" onClick={handleEditSubmit}>
            Uložiť
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ReservationsManagement;
