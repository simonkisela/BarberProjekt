// src/pages/Reservations.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/axios"; // náš custom axios

const Reservations = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get("/reservations");
        setReservations(response.data);
      } catch (err) {
        console.error("Chyba pri získavaní rezervácií", err);
      }
    };

    fetchReservations();
  }, []);

  return (
    <div>
      <h2>Rezervácie</h2>
      <ul>
        {reservations.map((r) => (
          <li key={r.id}>
            {r.name} – {r.date} {r.time}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reservations;
