import styles from "@/components/Footer/Footer.module.css";

const Footer = () => {
  return (
    <footer>
      <div className={styles.footerContent}>
        {/* FOOTER LEFT */}
        <div className={styles.footerLeft}>
          <ul className={styles.footerItems}>
            <li>Português (Brasil)</li>
            <li>English (US)</li>
            <li>Español</li>
            <li>Français (France)</li>
            <li>Italiano</li>
          </ul>
        </div>
        {/* FOOTER RIGHT */}
        <div className={styles.footerRight}>
          <ul>
            <li>The Games &copy; 2025</li>
          </ul>
        </div>
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <img src="/images/logo_camarize1.png" alt="Camarize Logo" style={{ width: 180, height: 40 }} />
      </div>
    </footer>
  );
};

export default Footer;
