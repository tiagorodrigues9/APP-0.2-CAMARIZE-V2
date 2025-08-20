import { useState, useEffect, useRef } from "react";
import styles from "../components/ProfileContent/ProfileContent.module.css";
import NavBottom from "../components/NavBottom";
import Notification from "../components/Notification";
import AuthError from "../components/AuthError";
import Loading from "../components/Loading";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [salvandoFoto, setSalvandoFoto] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef();

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  const handleEditPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification("Por favor, selecione apenas arquivos de imagem.", 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      showNotification("A imagem deve ter menos de 5MB.", 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewFoto(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSalvarFoto = async () => {
    if (!previewFoto) return;

    setSalvandoFoto(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      await axios.patch(`${apiUrl}/users/${userId}/photo`, { foto_perfil: previewFoto }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Atualizar o estado do usuário imediatamente
      setUser(prev => ({ ...prev, foto_perfil: previewFoto }));
      setPreviewFoto(null);
      showNotification("Foto atualizada com sucesso!", 'success');
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      showNotification("Erro ao salvar foto.", 'error');
    } finally {
      setSalvandoFoto(false);
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setLoading(false);
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await axios.get(`${apiUrl}/users/${userId}`);
        let foto_perfil = res.data.foto_perfil;
        if (foto_perfil && typeof foto_perfil === "string" && foto_perfil.startsWith("data:image")) {
          // base64 já com prefixo, usa direto
        } else if (foto_perfil && typeof foto_perfil === "string") {
          // Se for uma string base64 sem prefixo, adicionar prefixo
          foto_perfil = `data:image/jpeg;base64,${foto_perfil}`;
        } else {
          // Use o novo SVG de avatar como placeholder
          foto_perfil = "data:image/svg+xml;utf8,<svg width='110' height='110' viewBox='0 0 110 110' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='55' cy='55' r='55' fill='%23e6d6f7'/><circle cx='55' cy='45' r='22' fill='%23fff'/><ellipse cx='55' cy='85' rx='32' ry='18' fill='%23fff'/><circle cx='55' cy='45' r='14' fill='%23d1b3f7'/></svg>";
        }
        setUser({
          _id: res.data._id,
          nome: res.data.nome,
          email: res.data.email,
          senha: res.data.senha,
          foto_perfil
        });
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);



  if (loading) {
    return <Loading message="Carregando perfil..." />;
  }
  
  if (!user) {
    return <AuthError error="Não foi possível carregar o perfil. Verifique sua conexão e tente novamente." onRetry={() => window.location.reload()} />;
  }

  return (
    <>
      <div className={styles.profileWrapper}>
        <div className={styles.profileBox}>
          <button className={styles.backBtn} onClick={() => window.history.back()}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>&larr;</span>
          </button>
          <button
            title="Sair"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("usuarioCamarize");
              window.location.href = "/login";
            }}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              background: "none",
              border: "none",
              cursor: "pointer",
              zIndex: 2
            }}
          >
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
              <path d="M16 17v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 12h10m0 0-3-3m3 3-3 3" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 className={styles.title}>Perfil</h2>
          <div className={styles.avatarBox}>
            <img
              src={previewFoto || user.foto_perfil}
              alt="Foto do usuário"
              className={styles.avatar}
            />
            <button 
              className={styles.editPhotoBtn} 
              title="Editar foto"
              onClick={handleEditPhoto}
              type="button"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M15.232 5.232a3 3 0 1 1 4.243 4.243L7.5 21H3v-4.5L15.232 5.232Z" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <div className={styles.userName}>{user.nome}</div>
          <div className={styles.userRole}>Usuário</div>
          <form className={styles.formBox}>
            <label className={styles.label}>Nome Completo</label>
            <input className={styles.input} value={user.nome} disabled />
            <label className={styles.label}>E-mail</label>
            <input className={styles.input} value={user.email} disabled />
            <label className={styles.label}>Senha</label>
            <div className={styles.passwordBox}>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                value={user.senha}
                disabled
              />
              <button
                type="button"
                className={styles.showPasswordBtn}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </form>
          {previewFoto && (
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '24px'
            }}>
              <button
                onClick={handleSalvarFoto}
                disabled={salvandoFoto}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: salvandoFoto ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  opacity: salvandoFoto ? 0.7 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                {salvandoFoto ? 'Salvando...' : 'Salvar Foto'}
              </button>
              <button
                onClick={() => setPreviewFoto(null)}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'opacity 0.2s'
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
      <NavBottom />
      <Notification
        isVisible={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </>
  );
} 