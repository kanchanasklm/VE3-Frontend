import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  CardActions,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axios";

// Define enums as a simple object
const AuthMode = {
  LOGIN: "Login",
  SIGN_UP: "Sign Up",
};

const FieldNames = {
  USERNAME: "username",
  EMAIL: "email",
  PASSWORD: "password",
  CONFIRM_PASSWORD: "confirmPassword",
};

const ValidationMessages = {
  USERNAME_REQUIRED: "Username is required",
  EMAIL_REQUIRED: "Email is required",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_REQUIREMENTS:
    "Password must be at least 6 characters, contain one lowercase letter, one number, and one special character.",
  CONFIRM_PASSWORD_REQUIRED: "Confirm Password is required",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
};

const AuthForm = ({ isLogin, onToggle }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    [FieldNames.USERNAME]: "",
    [FieldNames.EMAIL]: "",
    [FieldNames.PASSWORD]: "",
    [FieldNames.CONFIRM_PASSWORD]: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" })); // Clear validation errors on change
  };

  const validateForm = () => {
    const errors = {};
    const passwordRegex =
      /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email && !isLogin) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email) && !isLogin) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData[FieldNames.USERNAME]) {
      errors[FieldNames.USERNAME] = ValidationMessages.USERNAME_REQUIRED;
    }
    if (!isLogin && !formData[FieldNames.EMAIL]) {
      errors[FieldNames.EMAIL] = ValidationMessages.EMAIL_REQUIRED;
    }
    if (!formData[FieldNames.PASSWORD]) {
      errors[FieldNames.PASSWORD] = ValidationMessages.PASSWORD_REQUIRED;
    } else if (!isLogin && !passwordRegex.test(formData[FieldNames.PASSWORD])) {
      errors[FieldNames.PASSWORD] = ValidationMessages.PASSWORD_REQUIREMENTS;
    }
    if (!isLogin && !formData[FieldNames.CONFIRM_PASSWORD]) {
      errors[FieldNames.CONFIRM_PASSWORD] =
        ValidationMessages.CONFIRM_PASSWORD_REQUIRED;
    }
    if (
      !isLogin &&
      formData[FieldNames.PASSWORD] !== formData[FieldNames.CONFIRM_PASSWORD]
    ) {
      errors[FieldNames.CONFIRM_PASSWORD] =
        ValidationMessages.PASSWORDS_DO_NOT_MATCH;
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({}); // Clear previous validation errors

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    const apiUrl = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin
      ? {
          [FieldNames.USERNAME]: formData[FieldNames.USERNAME],
          [FieldNames.PASSWORD]: formData[FieldNames.PASSWORD],
        }
      : {
          [FieldNames.USERNAME]: formData[FieldNames.USERNAME],
          [FieldNames.EMAIL]: formData[FieldNames.EMAIL],
          [FieldNames.PASSWORD]: formData[FieldNames.PASSWORD],
        };

    try {
      const response = await axiosInstance.post(apiUrl, payload);

      if (isLogin) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/tasks");
      }
      setSnackbar({
        open: true,
        message: isLogin
          ? `${AuthMode.LOGIN} successful!`
          : `${AuthMode.SIGN_UP} successful!`,
        severity: "success",
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const toggleAuthMode = () => {
    onToggle();
    setFormData({ username: "", email: "", password: "", confirmPassword: "" });
    setValidationErrors({});
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 5,
        p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography variant="h5" align="center">
        {isLogin ? AuthMode.LOGIN : AuthMode.SIGN_UP}
      </Typography>
      <CardContent component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          name={FieldNames.USERNAME}
          value={formData[FieldNames.USERNAME]}
          onChange={handleChange}
          margin="normal"
          error={!!validationErrors[FieldNames.USERNAME]}
          helperText={validationErrors[FieldNames.USERNAME]}
        />
        {!isLogin && (
          <TextField
            fullWidth
            label="Email"
            name={FieldNames.EMAIL}
            value={formData[FieldNames.EMAIL]}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors[FieldNames.EMAIL]}
            helperText={validationErrors[FieldNames.EMAIL]}
          />
        )}
        <TextField
          fullWidth
          label="Password"
          name={FieldNames.PASSWORD}
          type={showPassword ? "text" : "password"}
          value={formData[FieldNames.PASSWORD]}
          onChange={handleChange}
          margin="normal"
          error={!!validationErrors[FieldNames.PASSWORD]}
          helperText={validationErrors[FieldNames.PASSWORD]}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleTogglePassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
        />
        {!isLogin && (
          <TextField
            fullWidth
            label="Confirm Password"
            name={FieldNames.CONFIRM_PASSWORD}
            type="password"
            value={formData[FieldNames.CONFIRM_PASSWORD]}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors[FieldNames.CONFIRM_PASSWORD]}
            helperText={validationErrors[FieldNames.CONFIRM_PASSWORD]}
          />
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={toggleAuthMode}>
          {isLogin ? "Create an account" : "Already have an account?"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : isLogin ? (
            AuthMode.LOGIN
          ) : (
            AuthMode.SIGN_UP
          )}
        </Button>
      </CardActions>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default AuthForm;
