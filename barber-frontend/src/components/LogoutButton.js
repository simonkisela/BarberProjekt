import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Button variant="outlined" color="error" onClick={handleLogout}>
      Odhlásiť sa
    </Button>
  );
}

export default LogoutButton;
