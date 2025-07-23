// src/components/common/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // odstráni token
    navigate("/login"); // presmeruje na login
  };

  return (
    <button onClick={handleLogout} className="text-red-500 hover:underline">
      Odhlásiť sa
    </button>
  );
};

export default LogoutButton;
