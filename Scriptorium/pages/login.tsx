import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/login.module.css'; // Import the CSS module

interface LoginResponse {
  token: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); 

    try {
      const response = await axios.post<LoginResponse>('/api/auth/login', formData);

      // Popup for success
      setPopupMessage('Login successful! Redirecting...');
      localStorage.setItem('token', response.data.token);

      // Redirection
      setTimeout(() => {
        setPopupMessage(null); 
        router.push('/'); 
      }, 3000);
    } catch (error: any) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      {/* Logo */}
      <img
        src="/uploads/logos/logo.png"
        alt="Logo"
        className={styles.logo}
        onClick={handleLogoClick}
      />
      <div className={styles.card}>
        <h1 className={styles.title}>Log In</h1>
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        {popupMessage && (
          <div className={styles.popupMessage}>
            {popupMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="identifier" className={styles.label}>Username or Email</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
          >
            Log In
          </button>
        </form>

        <p className={styles.signUpText}>
          Don't have an account?{' '}
          <a href="/signup" className={styles.signUpLink}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
