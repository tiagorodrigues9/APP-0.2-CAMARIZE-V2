import { useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Notification from '../components/Notification';
import NavBottom from '../components/NavBottom';

const TIPOS_SENSORES = [
  { value: 'Temperatura', label: 'Temperatura' },
  { value: 'pH', label: 'pH' },
  { value: 'Amônia', label: 'Amônia' }
];

export default function CreateSensoresPage() {
  const router = useRouter();
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [apelido, setApelido] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef();

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tipoSelecionado) {
      showNotification('Selecione o tipo de sensor!', 'warning');
      return;
    }
    if (!apelido.trim()) {
      showNotification('Digite um apelido para o sensor!', 'warning');
      return;
    }
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const formData = new FormData();
    formData.append('id_tipo_sensor', tipoSelecionado);
    formData.append('apelido', apelido);
    if (arquivo) formData.append('foto_sensor', arquivo);
    try {
      await axios.post(`${apiUrl}/sensores`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showNotification('Sensor cadastrado com sucesso!');
      // Aguardar 2 segundos antes de redirecionar para a notificação aparecer
      setTimeout(() => {
        router.push('/sensores');
      }, 2000);
    } catch {
      showNotification('Erro ao cadastrar sensor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: '24px 32px' }}>
      <button 
        style={{ 
          background: 'none', 
          border: 'none', 
          fontSize: 28, 
          cursor: 'pointer', 
          marginBottom: 16,
          padding: '8px',
          borderRadius: '4px',
          transition: 'background-color 0.2s'
        }} 
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push('/sensores');
          }
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = 'rgba(0,0,0,0.05)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
        title="Voltar"
      >
        &larr;
      </button>
      <h2 style={{ fontWeight: 700, fontSize: '1.35rem', marginBottom: 8 }}>Cadastro de sensores</h2>
      <hr style={{ border: 'none', borderTop: '1.5px solid #eee', margin: '12px 0 24px 0' }} />
      <form onSubmit={handleSubmit}>
        <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 8 }}>Tipo do sensor</div>
        <select
          style={{ width: '100%', padding: '12px', borderRadius: 6, background: '#f5f5f5', border: 'none', fontSize: '1rem', marginBottom: 16 }}
          value={tipoSelecionado}
          onChange={e => setTipoSelecionado(e.target.value)}
        >
          <option value="">Selecione o sensor</option>
          {TIPOS_SENSORES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 8 }}>Apelido</div>
        <input
          type="text"
          value={apelido}
          onChange={e => setApelido(e.target.value)}
          placeholder="Ex: Sensor Temp 1"
          style={{ width: '100%', padding: '12px', borderRadius: 6, background: '#f5f5f5', border: 'none', fontSize: '1rem', marginBottom: 24 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
          <button type="button" style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontWeight: 500, marginRight: 16 }} onClick={() => fileInputRef.current.click()}>
            &#128228; Selecionar foto
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={e => setArquivo(e.target.files[0])} />
          <span style={{ color: '#888', fontSize: '0.98rem' }}>{arquivo ? arquivo.name : 'Nenhum arquivo inserido'}</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 0',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '1.08rem',
            background: 'linear-gradient(90deg, #ffb6b6 0%, #7ecbff 100%)',
            color: '#000',
            marginBottom: 16,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s'
          }}
        >
          Cadastrar
        </button>
      </form>
      <Notification
        isVisible={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
      
      {/* NavBottom */}
      <NavBottom />
    </div>
  );
} 