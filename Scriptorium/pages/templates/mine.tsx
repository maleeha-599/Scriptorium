// pages/templates/mine.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '../../styles/myTemplates.module.css';

export default function MyTemplates() {
  const [myTemplates, setMyTemplates] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchMyTemplates = async () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      if (!token) {
        return;
      }
      try {
        const response = await axios.get('/api/templates/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyTemplates(response.data.templates);
      } catch (error) {
        console.error('Error fetching my templates:', error);
      }
    };
    fetchMyTemplates();
  }, []);

  if (!isLoggedIn) {
    return <p>Please <Link href="/login">log in</Link> to view your templates.</p>;
  }

  return (
    <div className={styles.myTemplatesContainer}>
      <h2>My Templates</h2>
      {myTemplates.length > 0 ? (
        myTemplates.map((template) => (
          <div key={template.id} className={styles.templateCard}>
            <h3>{template.title}</h3>
            <p>{template.description}</p>
            <Link href={`/templates/${template.id}`}>View Template</Link>
          </div>
        ))
      ) : (
        <p>You haven't created any templates yet.</p>
      )}
    </div>
  );
}
