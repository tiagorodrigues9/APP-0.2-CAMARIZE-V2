import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import styles from "@/components/Menu/Menu.module.css";
import Link from "next/link";

const Menu = () => {
  const [menuIcon, setMenuIcon] = useState(<FaBars />);
  const [isActive, setIsActive] = useState(false);

  const activeMenu = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setMenuIcon(<IoClose />);
    } else {
      setMenuIcon(<FaBars />);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioCamarize");
    window.location.href = "/";
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/home">
          <img src="/images/logo_camarize1.png" alt="Camarize" />
        </Link>
      </div>
      <div className={styles.menu}>
        <ul
          className={`${styles.menuItems} ${isActive ? styles.active : ""}`}
          id={styles.menuItems}
        >
          <li>
            <Link href="/home">Home</Link>
          </li>
          <li>
            <Link href="/create-cativeiros">Cadastrar cativeiros</Link>
          </li>
          <li>
            <Link href="/sensores">Sensores</Link>
          </li>
          <li>
            <Link href="/settings">Configurações</Link>
          </li>
          <li>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </li>
        </ul>
      </div>
      <div className={styles.menuBtn} id="menuBtn">
        <i id={styles.menuIcon} onClick={activeMenu}>
          {menuIcon}
        </i>
      </div>
    </nav>
  );
};

export default Menu;
