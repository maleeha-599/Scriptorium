import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/createBlog.module.css"; 
import Navbar from '../../components/navbar'

export default function CreateBlog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [templateIds, setTemplateIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // New state for success message
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be signed in to create a blog post.");
      return;
    }

    const res = await fetch("/api/auth/blog/idx", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        content,
        tags,
        templateIds,
      }),
    });

    if (res.ok) {
      setSuccessMessage("Blog post created successfully!"); // Set success message on success
      setTimeout(() => {
        setSuccessMessage(""); // Clear the message after 5 seconds
        router.push("/blogs/idx"); // Redirect to the blog list page after successful post creation
      }, 5000);
    } else {
      const errorData = await res.json();
      setError(errorData.error || "An error occurred while creating the post.");
    }
  };

  return (
    <div className={styles.container}>
      {/* Navbar at the top */}
      <Navbar />
  
      <h1 className={styles.heading}>Create New Blog Post</h1>
      
      {error && <p className={styles.error}>{error}</p>}
  
      {/* Success Notification */}
      {successMessage && (
        <div className={styles.successNotification}>
          <p>{successMessage}</p>
        </div>
      )}
  
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            className={styles.input} 
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className={styles.textarea}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className={styles.textarea}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Tags (comma separated)</label>
          <input
            type="text"
            value={tags.join(", ")}
            onChange={(e) => setTags(e.target.value.split(", ").map((tag) => tag.trim()))}
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Template IDs (comma separated)</label>
          <input
            type="text"
            value={templateIds.join(", ")}
            onChange={(e) => setTemplateIds(e.target.value.split(", ").map((id) => id.trim()))}
            className={styles.input}
          />
        </div>
  
        <div className={styles.buttons}>
          <button type="submit" className={styles.submitButton}>Publish Post</button>
          <button type="button" className={styles.cancelButton} onClick={() => router.push("/blogs/idx")}>Cancel</button>
        </div>
      </form>
    </div>
  );
  
}

