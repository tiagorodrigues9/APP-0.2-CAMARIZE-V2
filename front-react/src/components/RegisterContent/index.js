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
  const [passwordError, setPasswordError] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  
  // Validação de senha
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "A senha deve ter pelo menos 8 caracteres";
    }
    if (password.length > 30) {
      return "A senha deve ter no máximo 30 caracteres";
    }
    
    // Regex para permitir apenas A-Z, a-z, 0-9, @, _, *, ., -
    const allowedChars = /^[A-Za-z0-9@_*.-]*$/;
    if (!allowedChars.test(password)) {
      return "A senha pode conter apenas letras (A-Z, a-z), números (0-9) e símbolos (@, _, *, ., -)";
    }
    
    return "";
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validationError = validatePassword(newPassword);
    setPasswordError(validationError);
    setPasswordValid(newPassword.length >= 8 && !validationError);
  };

  const isFormValid = name && email && password && !passwordError;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validar senha antes de enviar
    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }
    
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
            className={`${styles.input} ${passwordError ? styles.inputError : passwordValid ? styles.inputValid : ''}`}
            value={password}
            onChange={handlePasswordChange}
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
        
        {/* Regras de senha */}
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginBottom: '16px',
          padding: '8px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Regras da senha:</div>
          <div>• Mínimo 8 caracteres, máximo 30</div>
          <div>• Apenas: A-Z, a-z, 0-9, @, _, *, ., -</div>
        </div>
        
        {passwordError && (
          <div style={{ 
            color: '#dc3545', 
            fontSize: '12px', 
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px'
          }}>
            {passwordError}
          </div>
        )}
        
        {passwordValid && (
          <div style={{ 
            color: '#28a745', 
            fontSize: '12px', 
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            Senha válida! ✅
          </div>
        )}
        
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
        <Image src="/images/logo.svg" alt="Camarize Logo" width={180} height={40} />
      </div>
    </div>
  );
};

export default RegisterContent; 