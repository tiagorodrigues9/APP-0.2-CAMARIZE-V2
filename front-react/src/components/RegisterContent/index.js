import styles from "@/components/LoginContent/LoginContent.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useRegister } from "@/context/RegisterContext";

const RegisterContent = () => {
  const router = useRouter();
  const { } = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const isFormValid = name && email && password;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: name,
          email,
          senha: password,
          foto_perfil: null
        })
      });
      if (response.ok) {
        // Login automático após cadastro
        const loginRes = await fetch(`${apiUrl}/users/auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha: password })
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          localStorage.setItem("token", loginData.token);
          // Buscar o usuário pelo id do token
          const decoded = JSON.parse(atob(loginData.token.split('.')[1]));
          const userId = decoded.id;
          const userRes = await fetch(`${apiUrl}/users/${userId}`);
          const usuario = await userRes.json();
          localStorage.setItem("usuarioCamarize", JSON.stringify(usuario));
          // Redireciona para cadastro de fazenda
          router.push("/register/fazenda");
        } else {
          setError("Erro ao fazer login automático após cadastro.");
        }
      } else {
        const errorData = await response.text();
        console.error("Erro no registro:", errorData);
        setError(`Erro ao cadastrar usuário: ${errorData}`);
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
        <div className={styles.inputGroup}>
          <input
            type="text"
            name="name"
            placeholder="Nome"
            className={styles.input}
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Senha"
            className={styles.input}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <span
            className={styles.eyeIcon}
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={0}
            role="button"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" fill="#888"/><circle cx="12" cy="12" r="2.5" fill="#888"/></svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M2 2l20 20M12 5c-5 0-9.27 3.11-11 7a12.35 12.35 0 0 0 5.29 5.29M17.94 17.94A11.94 11.94 0 0 0 23 12c-1.73-3.89-6-7-11-7a11.94 11.94 0 0 0-5.29 1.29" stroke="#888" strokeWidth="2"/><path d="M9.5 9.5a3 3 0 0 1 4.24 4.24" stroke="#888" strokeWidth="2"/></svg>
            )}
          </span>
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
          style={{ background: "linear-gradient(90deg, #f7b0b7 0%, #a3c7f7 100%)", color: "#000" }}
        >
          Prosseguir
        </button>
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
};

export default RegisterContent; 