import React from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  return <AuthForm isLogin={false} onToggle={() => navigate("/login")} />;
};

export default Signup;
