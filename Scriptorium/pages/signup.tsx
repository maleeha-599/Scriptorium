import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/signup.module.css'; // Import the CSS module

interface SignupResponse {
  message: string;
  user?: {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    avatar: string;
    phone_number: string;
  };
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    avatar: '',
    phone_number: '',
  });

  const [errors, setErrors] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    try {
      const response = await axios.post<SignupResponse>('/api/auth/signup', formData);
      setPopupMessage(response.data.message);

      setFormData({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        avatar: '',
        phone_number: '',
      });

      setTimeout(() => {
        setPopupMessage(null);
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      if (error.response && error.response.data.error) {
        setErrors(error.response.data.error);
      } else {
        setErrors('An unexpected error occurred.');
      }
    }
  };

  const handleAvatarSelection = (avatar: string) => {
    setSelectedAvatar(avatar);
    setFormData({ ...formData, avatar });
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
        <h1 className={styles.title}>Sign Up</h1>

        {errors && <p className={styles.errorMessage}>{errors}</p>}
        {popupMessage && (
          <div className={styles.popupMessage}>
            {popupMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div>
            <label className={styles.label}>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div>
            <label className={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div>
            <label className={styles.label}>Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className={styles.label}>Avatar</label>
            <div className={styles.avatarSelection}>
              {['avatar1.png', 'avatar2.png', 'avatar3.png'].map((avatar, index) => (
                <div
                  key={index}
                  onClick={() => handleAvatarSelection(`/uploads/avatars/${avatar}`)}
                  className={`${styles.avatarOption} ${formData.avatar === `/uploads/avatars/${avatar}` ? styles.selectedAvatar : ''}`}
                >
                  <img
                    src={`/uploads/avatars/${avatar}`}
                    alt={`Avatar ${index + 1}`}
                    className={styles.avatarImage}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
          >
            Sign Up
          </button>
        </form>

        <div className={styles.signInText}>
          <p className={styles.signInLink}>
            Already have an account?{' '}
            <a href="/login" className={styles.link}
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
