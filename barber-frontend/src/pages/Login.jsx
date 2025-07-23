// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      const token = response.data.token;
      localStorage.setItem("token", token); // uloženie tokenu
      setErrorMsg("");
      alert("Úspešné prihlásenie ✅");
      // môžeš redirectnúť na dashboard atď.
    } catch (error) {
      setErrorMsg("Zlé meno alebo heslo.");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Prihlásenie</h2>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <input
        type="text"
        placeholder="Používateľské meno"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <br />
      <input
        type="password"
        placeholder="Heslo"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <br />
      <button type="submit">Prihlásiť sa</button>
    </form>
  );
};

export default Login;
