import React, { useState, useMemo, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Switch,
  FormControlLabel,
  CssBaseline,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const navigate = useNavigate();

  const { executeRecaptcha } = useGoogleReCaptcha();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: darkMode ? "#90caf9" : "#1976d2",
          },
          background: {
            default: darkMode ? "#121212" : "#fafafa",
            paper: darkMode ? "#1d1d1d" : "#fff",
          },
          error: {
            main: "#f44336",
          },
        },
        typography: {
          fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        },
      }),
    [darkMode]
  );

  const isFormValid = () =>
    username.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!isFormValid()) {
      setError("Prosím, vyplň všetky polia správne.");
      return;
    }

    if (!executeRecaptcha) {
      setError("Nepodarilo sa načítať reCAPTCHA.");
      return;
    }

    try {
      const token = await executeRecaptcha("login");
      setRecaptchaToken(token);

      setLoading(true);

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          recaptcha_token: token,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/admin");
      } else {
        setError(data.message || "Nesprávne prihlasovacie údaje");
      }
    } catch (err) {
      setError("Chyba pri pripájaní na server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 10,
          p: 4,
          boxShadow: 6,
          borderRadius: 3,
          backgroundColor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode((prev) => !prev)}
                color="primary"
              />
            }
            label={darkMode ? "Tmavý režim" : "Svetlý režim"}
          />
        </Box>

        <Typography
          variant="h5"
          align="center"
          gutterBottom
          component={motion.h1}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          sx={{ fontWeight: "700", color: "primary.main" }}
        >
          Prihlásenie
        </Typography>

        <form onSubmit={handleLogin}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Používateľské meno"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
              variant="outlined"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Heslo"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              variant="outlined"
            />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Typography
                  color="error"
                  mt={1}
                  sx={{ fontWeight: "600", textAlign: "center" }}
                >
                  {error}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>

          <Box sx={{ position: "relative", mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: "700",
                fontSize: "1.1rem",
                letterSpacing: 1,
                background: darkMode
                  ? "linear-gradient(45deg, #90caf9 30%, #42a5f5 90%)"
                  : "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                boxShadow: darkMode
                  ? "0 3px 5px 2px rgba(66, 165, 245, .6)"
                  : "0 3px 5px 2px rgba(21, 101, 192, .3)",
                "&:hover": {
                  background: darkMode
                    ? "linear-gradient(45deg, #64b5f6 30%, #2196f3 90%)"
                    : "linear-gradient(45deg, #1565c0 30%, #2196f3 90%)",
                  boxShadow: darkMode
                    ? "0 6px 10px 4px rgba(66, 165, 245, .8)"
                    : "0 6px 10px 4px rgba(21, 101, 192, .4)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Prihlásiť sa"}
            </Button>
          </Box>
        </form>
      </Box>
    </ThemeProvider>
  );
}

export default Login;
