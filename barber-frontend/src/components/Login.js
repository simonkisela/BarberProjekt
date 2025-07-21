import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      navigate('/');
    } else {
      setError(data.message || 'Nesprávne prihlasovacie údaje');
    }
  } catch {
    setError('Chyba pri pripájaní na server');
  }
};


  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" align="center" gutterBottom>Prihlásenie</Typography>
      <form onSubmit={handleLogin}>
        <TextField
          fullWidth
          margin="normal"
          label="Používateľské meno"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Heslo"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Typography color="error" mt={1}>{error}</Typography>}
        <Button
          fullWidth
          variant="contained"
          type="submit"
          sx={{ mt: 2 }}
        >
          Prihlásiť sa
        </Button>
      </form>
    </Box>
  );
}

export default Login;
