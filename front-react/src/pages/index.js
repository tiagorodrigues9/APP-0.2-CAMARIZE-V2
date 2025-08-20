import Head from "next/head";
import styles from "@/styles/StartScreen.module.css";
import Image from "next/image";
import { useRouter } from "next/router";

export default function StartScreen() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Camarize - Início</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.startMain}>
        <div className={styles.logoBox}>
          <Image src="/images/logo_camarize1.png" alt="Camarize Logo" width={180} height={40} />
        </div>
        <div className={styles.waveBg}></div>
        <button className={styles.startButton} onClick={() => router.push("/login")}>Conecte-se</button>
      </main>
    </>
  );
} 