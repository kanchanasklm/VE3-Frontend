import React from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  return <AuthForm isLogin={true} onToggle={() => navigate("/signup")} />;
};

export default Login;
