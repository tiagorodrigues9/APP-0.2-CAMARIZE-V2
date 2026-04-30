import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import styles from "@/components/Menu/Menu.module.css";
import Link from "next/link";
import Modal from "@/components/Modal";

const Menu = () => {
  const [menuIcon, setMenuIcon] = useState(<FaBars />);
  const [isActive, setIsActive] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("usuarioCamarize") || localStorage.getItem("usuarioCamarize");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setNomeUsuario(u?.nome || u?.email || "");
      } catch {}
    }
  }, []);

  const activeMenu = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setMenuIcon(<IoClose />);
    } else {
      setMenuIcon(<FaBars />);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      if (token) {
        await fetch("/api/users/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Prossegue com logout local mesmo se a requisição falhar
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("usuarioCamarize");
      localStorage.removeItem("token");
      localStorage.removeItem("usuarioCamarize");
      window.location.href = "/";
    }
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Link href="/home">
            <img src="/images/logo.svg" alt="Logo" style={{ height: 28, width: 'auto' }} />
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
            <li className={styles.userGreeting}>
              {nomeUsuario && <span>Olá, {nomeUsuario}</span>}
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Sair
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

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sair da conta"
        closeOnBackdropClick={!isLoggingOut}
      >
        <p className={styles.logoutModalText}>
          Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o sistema.
        </p>
        <div className={styles.logoutModalActions}>
          <button
            className={styles.logoutModalCancel}
            onClick={() => setShowLogoutModal(false)}
            disabled={isLoggingOut}
          >
            Cancelar
          </button>
          <button
            className={styles.logoutModalConfirm}
            onClick={confirmLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Menu;
