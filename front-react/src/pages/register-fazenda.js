import styles from "@/components/LoginContent/LoginContent.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function RegisterFazendaPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [numero, setNumero] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isFormValid = nome && rua && bairro && cidade && numero;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Você precisa estar logado para cadastrar uma fazenda.");
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/fazendas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome,
          rua,
          bairro,
          cidade,
          numero
        })
      });
      if (response.ok) {
        setSuccess("Fazenda cadastrada com sucesso!");
        setNome(""); setRua(""); setBairro(""); setCidade(""); setNumero("");
        router.push("/home");
      } else {
        const data = await response.json();
        console.error("Erro ao cadastrar fazenda:", data);
        setError(data.error || "Erro ao cadastrar fazenda.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      setError(`Erro de conexão com o servidor: ${error.message}`);
    }
  };

  return (
    <div className={styles.loginMobileWrapper}>
      <form className={styles.loginForm} onSubmit={handleRegister}>
        <h2 className={styles.loginTitle}>Cadastre-se para continuar</h2>
        <label style={{marginBottom: 4, fontWeight: 500}}>Nome da fazenda:</label>
        <div className={styles.inputGroup}>
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            className={styles.input}
            value={nome}
            onChange={e => setNome(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <label style={{marginBottom: 4, fontWeight: 500}}>Endereço</label>
        <div className={styles.inputGroup}>
          <input
            type="text"
            name="rua"
            placeholder="Rua"
            className={styles.input}
            value={rua}
            onChange={e => setRua(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="text"
            name="bairro"
            placeholder="Bairro"
            className={styles.input}
            value={bairro}
            onChange={e => setBairro(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            name="cidade"
            placeholder="Cidade"
            className={styles.input}
            value={cidade}
            onChange={e => setCidade(e.target.value)}
            autoComplete="off"
            required
            style={{ flex: 2 }}
          />
          <input
            type="text"
            name="numero"
            placeholder="Número"
            className={styles.input}
            value={numero}
            onChange={e => setNumero(e.target.value)}
            autoComplete="off"
            required
            style={{ flex: 1 }}
          />
        </div>
        <div className={styles.rememberRow}>
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            className={styles.checkbox}
          />
          <label htmlFor="remember" className={styles.rememberLabel}>Lembre-me</label>
        </div>
        <button
          type="submit"
          className={styles.loginButton}
          disabled={!isFormValid}
          style={{ background: "linear-gradient(90deg, #f7b0b7 0%, #a3c7f7 100%)", color: "#fff" }}
        >
          Cadastrar
        </button>
        {success && <div style={{ color: "green", marginTop: 8 }}>{success}</div>}
        {error && <div className={styles.errorMsg}>{error}</div>}
        <div className={styles.registerRow}>
          <span>Já tem uma conta?</span>
          <Link href="/login" className={styles.registerLink}>Conecte-se agora</Link>
        </div>
      </form>
      <div className={styles.logoWrapper}>
        <Image src="/images/logo_camarize1.png" alt="Camarize Logo" width={180} height={40} />
      </div>
    </div>
  );
} 