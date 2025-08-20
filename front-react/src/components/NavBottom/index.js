import { useRouter } from "next/router";
import styles from "./NavBottom.module.css";

export default function NavBottom() {
  const router = useRouter();
  return (
    <nav className={styles.navBottom}>
      <button onClick={() => router.push('/home')}><img src="/images/home.svg" alt="Home" /></button>
      <button onClick={() => router.push('/settings')}><img src="/images/settings.svg" alt="Settings" /></button>
      <button onClick={() => router.push('/create-cativeiros')} className={styles.plusButton}>
        <img src="/images/plus.svg" alt="Adicionar" className={styles.plusIcon} />
      </button>
      <button onClick={() => router.push('/notifications')}><img src="/images/bell.svg" alt="Notificações" /></button>
      <button onClick={() => router.push('/profile')}><img src="/images/user.svg" alt="Perfil" /></button>
    </nav>
  );
} 