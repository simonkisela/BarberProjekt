import React from "react";
import { Typography, Box, Paper, Grid, Button } from "@mui/material";
import { Link } from "react-router-dom";

function DashboardHome() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Vitaj v Admin Dashboarde
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Tu môžeš spravovať rezervácie a administrátorov.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={3}
            sx={{ p: 3, textAlign: "center", borderRadius: 3 }}
          >
            <Typography variant="h5" gutterBottom>
              Rezervácie
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Prezri si a spravuj všetky aktuálne rezervácie.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/admin/reservations"
              color="primary"
            >
              Otvoriť rezervácie
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper
            elevation={3}
            sx={{ p: 3, textAlign: "center", borderRadius: 3 }}
          >
            <Typography variant="h5" gutterBottom>
              Administrátori
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Spravuj administrátorov, pridávaj alebo odoberaj prístupy.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/admin/admins"
              color="secondary"
            >
              Správa adminov
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardHome;
