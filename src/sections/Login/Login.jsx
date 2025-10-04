import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../api";
import "./Login.css";
import ShinyText from "../../components/ShinyText/ShinyText";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const { mutate, isLoading, error } = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      // Support both shapes: { success: true } or { status: 'success' }
      const token = data && data.token;
      const successFlag =
        (data && data.success === true) ||
        (data && typeof data.status === "string" && data.status.toLowerCase() === "success") ||
        (data && typeof data.message === "string" && data.message.toLowerCase().includes("success"));

      if (successFlag && token) {
        localStorage.setItem("token", token);
        navigate("/dashboard", { replace: true });
        setApiError("");
      } else {
        const serverMsg = (data && (data.message || data.error || data.msg)) || "";
        setApiError(serverMsg || "Invalid credentials or unexpected response.");
      }
    },
    onError: (err) => {
      // Attempt to read a useful message from server error shape
      const serverMsg =
        (err && err.response && err.response.data && (err.response.data.message || err.response.data.error)) ||
        err?.message ||
        "Network or server error. Please try again.";
      setApiError(serverMsg);
    },
  });

  return (
    <div className="login-bg has-image flex items-center justify-center min-h-screen">
      <form
        className="login-form w-full max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          setApiError("");
          mutate();
        }}
      >
   <h1>
            <ShinyText 
            text="Login"
            speed={3}
            className='shiny-heading login-title'
            />

            </h1>        <input
          type="email"
          className="login-input w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="password"
          className="login-input w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <button type="submit" className="login-btn w-full" disabled={isLoading} aria-busy={isLoading}>
          {isLoading && <span className="login-spinner" aria-hidden="true"></span>}
          <span>{isLoading ? "Logging in..." : "Login"}</span>
        </button>
        {(apiError || error) && (
          <div className="text-red-500 mt-4 text-center" role="alert">
            {apiError || "Login failed. Please try again."}
          </div>
        )}
        {isLoading && (
          <div className="mt-2 text-center text-gray-500">Please wait...</div>
        )}
      </form>
    </div>
  );
}
