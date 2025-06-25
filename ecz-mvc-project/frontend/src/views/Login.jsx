import React from 'react';
import LoginForm from '../components/auth/LoginForm';

function Login() {
  const handleLogin = (credentials) => {
    // Implement login logic here (call backend API)
    alert(`Logging in with email: ${credentials.email}`);
  };

  return (
    <div>
      <h1>Login</h1>
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}

export default Login;