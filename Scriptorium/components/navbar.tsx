import { useRouter } from "next/router";
import styles from "../styles/blog.module.css"; // Adjust the path if your styles are in a different folder

const Navbar = () => {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  const navigateToTemplates = () => {
    router.push('/templates');
  };

  const navigateToCode = () => {
    router.push('/code');
  };

  const navigateToBlog = () => {
    router.push('/blogs/idx');
  }

  return (
    <div className={styles.container}>
      <img
        src="/uploads/logos/logo.png"
        alt="Logo"
        className={styles.logo}
        onClick={handleLogoClick}
      />
      <button className={styles.left} onClick={navigateToBlog}>
        Blog Posts
      </button>
      <button className={styles.left} onClick={navigateToTemplates}>
        Templates
      </button>
      <button className={styles.left} onClick={navigateToCode}>
        Code
      </button>
    </div>
  );
};

export default Navbar;
