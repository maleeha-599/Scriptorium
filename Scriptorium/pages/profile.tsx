// // Chatgpt help with picture rendering

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/profile.module.css';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        avatar: '',
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
    });
    const [updateMessage, setUpdateMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/api/updateUser', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => (response.ok ? response.json() : Promise.reject()))
                .then((data) => {
                    setUser(data.user);
                    setFormData({ ...data.user });
                    setSelectedAvatar(data.user.avatar);
                })
                .catch(() => router.push('/'));
        } else {
            router.push('/');
        }
    }, [router]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (isChangingPassword) {
            setIsChangingPassword(false); // Close change password form if it's open
        }
    };

    const handleChangePasswordToggle = () => {
        setIsChangingPassword(!isChangingPassword);
        if (isEditing) {
            setIsEditing(false); // Close edit profile form if it's open
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('/api/updateUser', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                });
                if (response.ok) {
                    const updatedUser = await response.json();
                    setUser(updatedUser.user);
                    setUpdateMessage('Profile updated successfully!');
                    setIsEditing(false);
                } else {
                    setUpdateMessage('Failed to update profile.');
                }
            } catch {
                setUpdateMessage('An error occurred while updating.');
            }
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('/api/updateUser', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        password: passwordData.newPassword,
                    }),
                });
    
                const result = await response.json();
    
                if (response.ok) {
                    setPasswordMessage('Password changed successfully!');
                    setIsChangingPassword(false);
                    setPasswordData({
                        newPassword: '',
                    });
                } else {
                    setPasswordMessage(result.error || 'Failed to change password.');
                }
            } catch (error) {
                console.error('Error changing password:', error);
                setPasswordMessage('An error occurred while changing password.');
            }
        } else {
            setPasswordMessage('You are not authorized. Please log in again.');
        }
    };
    

    const handleAvatarSelection = (avatar: string) => {
        setSelectedAvatar(avatar);
        setFormData({ ...formData, avatar });
    };

    if (!user) {
        return (
            <div className={styles.container}>
                <span>Loading...</span>
            </div>
        );
    }

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
                <div className={styles.avatarContainer}>
                    {user.avatar ? (
                        <img src={user.avatar} alt="User Avatar" className={styles.avatar} />
                    ) : (
                        <div className={styles.placeholderAvatar}>
                            {user.first_name[0]}
                            {user.last_name[0]}
                        </div>
                    )}
                </div>

                <h1 className={styles.title}>
                    {user.first_name} {user.last_name}
                </h1>

                <div className={styles.info}>
                    <p>
                        <span className={styles.label}>Username:</span> {user.username}
                    </p>
                    <p>
                        <span className={styles.label}>Email:</span> {user.email}
                    </p>
                    <p>
                        <span className={styles.label}>Phone:</span> {user.phone_number}
                    </p>
                </div>

                <div className={styles.buttonRow}>
                    <button
                        onClick={handleEditToggle}
                        className={`${styles.button} ${styles.editButton}`}
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={handleChangePasswordToggle}
                        className={`${styles.button} ${styles.changePasswordButton}`}
                    >
                        Change Password
                    </button>
                </div>

                {isEditing && (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="First Name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Last Name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Username"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Email"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Phone Number"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Avatar</label>
                            <div className={styles.avatarSelection}>
                                {['avatar1.png', 'avatar2.png', 'avatar3.png'].map((avatar, index) => (
                                    <div
                                        key={index}
                                        onClick={() =>
                                            handleAvatarSelection(`/uploads/avatars/${avatar}`)
                                        }
                                        className={`${styles.avatarOption} ${
                                            formData.avatar === `/uploads/avatars/${avatar}`
                                                ? styles.avatarOptionSelected
                                                : ''
                                        }`}
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

                        <div className={styles.buttonRow}>
                            <button
                                type="button"
                                onClick={handleEditToggle}
                                className={`${styles.button} ${styles.cancelButton}`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`${styles.button} ${styles.submitButton}`}
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}

                {isChangingPassword && (
                    <form onSubmit={handlePasswordSubmit} className={styles.form}>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className={styles.input}
                                placeholder="New Password"
                            />
                        </div>

                        <div className={styles.buttonRow}>
                            <button
                                type="button"
                                onClick={handleChangePasswordToggle}
                                className={`${styles.button} ${styles.cancelButton}`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`${styles.button} ${styles.submitButton}`}
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}

                {updateMessage && (
                    <p className={`${styles.message} ${styles.success}`}>{updateMessage}</p>
                )}
                {passwordMessage && (
                    <p className={`${styles.message} ${styles.error}`}>{passwordMessage}</p>
                )}
            </div>
        </div>
    );
}
