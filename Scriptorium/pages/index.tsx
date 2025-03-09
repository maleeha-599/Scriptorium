 // Chatgpt used for page rendering

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/index.module.css';

export default function IndexPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const [userAvatar, setUserAvatar] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);  
    const [loading, setLoading] = useState(true);
    const [popupMessage, setPopupMessage] = useState<string | null>(null);
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setIsAuthenticated(false);
            setTimeout(() => {
                setLoading(false);
            }, 5000); // Change if we want
            return;
        }

        setIsAuthenticated(true);

        fetch('/api/updateUser', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch user data');
                }
            })
            .then((data) => {
                setUserName(data.user.first_name);
                setUserAvatar(data.user.avatar);
                setIsAdmin(data.user.is_admin);  // Set the admin status
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
                setIsAuthenticated(false);
            })
            .finally(() => {
                setTimeout(() => {
                    setLoading(false);
                }, 5000); //Change if we want
            });
    }, []);

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('Failed to logout:', response.statusText);
                const errorText = await response.text();
                console.error('Response body:', errorText);
                return;
            }

            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setPopupMessage('Logout successful!');
            setTimeout(() => {
                setPopupMessage(null);
                router.push('/');
            }, 3000);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <img 
                    src="/uploads/logos/loadingL.gif" 
                    alt="Loading GIF" 
                    className={styles.loadingGif} 
                />
            </div>
        );
    }

return (
    <div className={styles.container}>
        {/* Top-right authentication buttons */}
        <div className={styles.authButtons}>
            {!isAuthenticated ? (
                <>
                    <button
                        className={`${styles.button} ${styles.blueButton}`}
                        onClick={() => router.push('/login')}
                    >
                        Login
                    </button>
                    <button
                        className={`${styles.button} ${styles.blueButton}`}
                        onClick={() => router.push('/signup')}
                    >
                        Sign Up
                    </button>
                </>
            ) : (
                <>  
                    {isAdmin && (
                        <button
                            onClick={() => router.push('/reports')}
                            className={`${styles.button} ${styles.redButton}`}
                        >
                            Reports
                        </button>
                    )}

                    {/* Profile dropdown menu */}
                    <div className={styles.dropdownContainer}>
                        <button
                            className={styles.profileButton}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {userAvatar && (
                                <img
                                    src={userAvatar}
                                    alt="User Avatar"
                                    className={styles.avatar}
                                />
                            )}
                            <span>Hi, {userName}!</span>
                        </button>
                        {isDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                <button
                                    onClick={() => router.push('/profile')}
                                    className={styles.dropdownItem}
                                >
                                    View Profile
                                </button>
                                <button
                                    onClick={() => router.push('/myBlogs')}
                                    className={styles.dropdownItem}
                                >
                                    My Blog Posts
                                </button>
                                <button
                                    onClick={() => router.push('templates/my-templates')}
                                    className={styles.dropdownItem}
                                >
                                    My Templates
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className={`${styles.button} ${styles.blueButton}`}
                    >
                        Logout
                    </button>
                </>
            )}
        </div>

        {/* Center content */}
        <div className={styles.centerContent}>
            <h1 className={styles.welcomeText}>WELCOME TO</h1>
            <img
                src="/uploads/logos/nameLogo.png"
                alt="Scriptorium Logo"
                className={styles.logo}
                onClick={() => window.location.reload()}
            />
            <div className={styles.buttonRow}>
                <button
                    className={styles.profileButton}
                    onClick={() => router.push('/blogs/idx')}
                >
                    Blog Posts
                </button>
                <button
                    className={styles.profileButton}
                    onClick={() => router.push('/templates')}
                >
                    Templates
                </button>
                <button
                    className={styles.profileButton}
                    onClick={() => router.push('/code')}
                >
                    Code
                </button>
            </div>
        </div>

        {popupMessage && (
            <div className={styles.popupMessage}>
                {popupMessage}
            </div>
        )}
    </div>
);
}