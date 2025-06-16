import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Checkbox,
  FormControlLabel,
  InputAdornment,
} from "@mui/material";
import { FaUser, FaLock, FaArrowRight, FaCalendarCheck } from "react-icons/fa";
import axios from "axios";
import "../styles/Login.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        "https://tfg-dam-mabedi.onrender.com/auth/login",
        { username, password }
      );
      const { token, role } = response.data;
      onLogin(token, role);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Credenciales inválidas."
          : "Error de conexión. Intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Cabecera azul */}
      <Box className="login-header">
        <Box className="login-header-left">
          <FaCalendarCheck size={28} />
          <Typography variant="h6" fontWeight="bold" component="h1">
            MaBeDi Medic
          </Typography>
        </Box>
        <Typography variant="body2" className="login-header-subtitle">
          Gestión de Citas Médicas
        </Typography>
      </Box>

      {/* Contenedor principal */}
      <Container className="login-container">
        <Paper elevation={6} className="login-paper">
          <Box className="login-form-header">
            <Typography variant="h5" fontWeight="bold">
              Bienvenido
            </Typography>
            <Typography className="login-form-subtitle">
              Por favor inicia sesión para acceder
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleLogin}
            noValidate
            className="login-form"
          >
            {error && (
              <Alert severity="error" className="login-alert-error">
                {error}
              </Alert>
            )}

            <TextField
              label="Correo o Usuario"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              disabled={loading}
              autoComplete="current-username"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaUser color="#9ca3af" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Contraseña"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaLock color="#9ca3af" />
                  </InputAdornment>
                ),
              }}
            />

            <Box className="login-form-footer">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Recordarme"
              />
              <Button
                variant="text"
                size="small"
                className="login-link-button"
                onClick={() =>
                  alert(
                    "Funcionalidad de recuperar contraseña aún no implementada"
                  )
                }
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              className="login-submit-button"
              startIcon={<FaArrowRight />}
            >
              {loading ? "Entrando..." : "Iniciar Sesión"}
            </Button>

            {/* Texto de contacto con margen extra */}
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 3 }}
            >
              ¿No tienes cuenta? Contacta al administrador.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
}