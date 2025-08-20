import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/components/CreateContent/CreateContent.module.css";
import axios from "axios";
import SelectTipoCamarao from "@/components/SelectTipoCamarao";
import Notification from "@/components/Notification";

export default function EditCativeiroPage() {
  const router = useRouter();
  const { id } = router.query;
  const [cativeiro, setCativeiro] = useState(null);
  const [fazendas, setFazendas] = useState([]);
  const [tiposCamarao, setTiposCamarao] = useState([]);
  const [fazendaSelecionada, setFazendaSelecionada] = useState("");
  const [tipoCamarao, setTipoCamarao] = useState(null);
  const [dataInstalacao, setDataInstalacao] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [sensores, setSensores] = useState(["", "", ""]);
  const [sensoresDisponiveis, setSensoresDisponiveis] = useState([]);
  const [tempMedia, setTempMedia] = useState("");
  const [phMedio, setPhMedio] = useState("");
  const [amoniaMedia, setAmoniaMedia] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef();

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  useEffect(() => {
    console.log('useEffect fetchCativeiro chamado com ID:', id);
    console.log('Router query completo:', router.query);
    console.log('Router isReady:', router.isReady);
    if (router.isReady && id && id !== 'undefined') {
      fetchCativeiro();
    }
  }, [id, router.isReady]);

  // Configurar tipo de camarão quando os dados estiverem disponíveis
  useEffect(() => {
    console.log('useEffect configureTipoCamarao chamado:', { 
      cativeiro: !!cativeiro, 
      tiposCamarao: tiposCamarao.length 
    });
    if (cativeiro && tiposCamarao.length > 0) {
      configureTipoCamarao();
    }
  }, [cativeiro, tiposCamarao]);

  // Verificar se todos os dados necessários foram carregados
  useEffect(() => {
    console.log('Verificando dados carregados:', { 
      cativeiro: !!cativeiro, 
      tiposCamarao: tiposCamarao.length, 
      loading,
      fazendas: fazendas.length,
      sensoresDisponiveis: sensoresDisponiveis.length
    });
    if (cativeiro && tiposCamarao.length > 0 && fazendas.length > 0 && !loading) {
      console.log('Dados mínimos carregados, marcando como carregado');
      setDataLoaded(true);
    }
  }, [cativeiro, tiposCamarao, fazendas, loading]);

  useEffect(() => {
    console.log('Carregando dados iniciais...');
    async function fetchFazendas() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await axios.get(`${apiUrl}/fazendas`);
        console.log('Fazendas carregadas:', res.data);
        setFazendas(res.data);
      } catch (err) {
        console.error('Erro ao carregar fazendas:', err);
        setFazendas([]);
      }
    }
    async function fetchTiposCamarao() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await axios.get(`${apiUrl}/tipos-camarao`);
        console.log('Tipos de camarão carregados:', res.data);
        setTiposCamarao(res.data);
      } catch (err) {
        console.error('Erro ao carregar tipos de camarão:', err);
        setTiposCamarao([]);
      }
    }
    async function fetchSensores() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await axios.get(`${apiUrl}/sensores`);
        console.log('Sensores carregados:', res.data);
        setSensoresDisponiveis(res.data);
      } catch (err) {
        console.error('Erro ao carregar sensores:', err);
        setSensoresDisponiveis([]);
      }
    }
    
    // Carregar dados em paralelo
    fetchFazendas();
    fetchTiposCamarao();
    fetchSensores();
  }, []);

  const fetchCativeiro = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      console.log('Buscando cativeiro com ID:', id);
      const res = await axios.get(`${apiUrl}/cativeiros/${id}`);
      const cativeiroData = res.data;
      console.log('Dados do cativeiro carregados:', cativeiroData);
      console.log('Campo fazenda do cativeiro:', cativeiroData.fazenda);
      setCativeiro(cativeiroData);
      
      // Preencher os campos com os dados existentes
      const fazendaId = (cativeiroData.fazenda?._id || cativeiroData.fazenda || "").toString();
      setFazendaSelecionada(fazendaId);
      console.log('Fazenda selecionada:', fazendaId);
      console.log('Fazendas disponíveis:', fazendas.map(f => f._id));
      
      console.log('Configurando data de instalação:', cativeiroData.data_instalacao);
      setDataInstalacao(cativeiroData.data_instalacao ? new Date(cativeiroData.data_instalacao).toISOString().split('T')[0] : "");
      
      // Usar dados das condições ideais se disponíveis
      console.log('Condições ideais:', cativeiroData.condicoes_ideais);
      if (cativeiroData.condicoes_ideais) {
        console.log('Usando dados das condições ideais');
        setTempMedia(cativeiroData.condicoes_ideais.temp_ideal?.toString() || "");
        setPhMedio(cativeiroData.condicoes_ideais.ph_ideal?.toString() || "");
        setAmoniaMedia(cativeiroData.condicoes_ideais.amonia_ideal?.toString() || "");
      } else {
        console.log('Usando dados antigos do cativeiro');
        // Fallback para dados antigos se não houver condições ideais
        setTempMedia(cativeiroData.temp_media_diaria || "");
        setPhMedio(cativeiroData.ph_medio_diario || "");
        setAmoniaMedia(cativeiroData.amonia_media_diaria || "");
      }
      
      // Carregar sensores relacionados ao cativeiro
      console.log('Sensores do cativeiro:', cativeiroData.sensores);
      if (cativeiroData.sensores && cativeiroData.sensores.length > 0) {
        const sensoresIds = cativeiroData.sensores.map(sensor => sensor._id || sensor);
        console.log('IDs dos sensores:', sensoresIds);
        
        // Manter sempre 3 campos disponíveis, preenchendo com os sensores existentes
        const sensoresCompletos = ["", "", ""];
        sensoresIds.forEach((sensorId, index) => {
          if (index < 3) {
            sensoresCompletos[index] = sensorId;
          }
        });
        setSensores(sensoresCompletos);
      }
      
      // Processar imagem atual se existir
      if (cativeiroData.foto_cativeiro && cativeiroData.foto_cativeiro.data) {
        const base64String = arrayBufferToBase64(cativeiroData.foto_cativeiro.data);
        setCurrentImageUrl(`data:image/jpeg;base64,${base64String}`);
      }
      
      // O tipo de camarão será configurado em um useEffect separado
      console.log('Tipo de camarão do cativeiro:', cativeiroData.id_tipo_camarao);
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar cativeiro:', err);
      showNotification('Erro ao carregar dados do cativeiro', 'error');
      router.push('/home');
    }
  };

  // Função para converter buffer para base64
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Função para configurar o tipo de camarão quando os dados estiverem disponíveis
  const configureTipoCamarao = () => {
    console.log('Configurando tipo de camarão:', { cativeiro, tiposCamarao });
    if (cativeiro && tiposCamarao.length > 0 && cativeiro.id_tipo_camarao) {
      console.log('Tipo de camarão do cativeiro:', cativeiro.id_tipo_camarao);
      console.log('Tipos disponíveis:', tiposCamarao);
      
      // Verificar se o tipo de camarão é um objeto populado ou apenas um ID
      const tipoId = cativeiro.id_tipo_camarao._id || cativeiro.id_tipo_camarao;
      console.log('ID do tipo de camarão:', tipoId);
      
      const tipo = tiposCamarao.find(t => t._id === tipoId);
      console.log('Tipo encontrado:', tipo);
      
      if (tipo) {
        console.log('Configurando tipo de camarão:', { value: tipo._id, label: tipo.nome });
        setTipoCamarao({ value: tipo._id, label: tipo.nome });
      } else {
        console.log('Tipo de camarão não encontrado na lista');
      }
    } else {
      console.log('Dados insuficientes para configurar tipo de camarão');
    }
  };

  const handleSensorChange = (idx, value) => {
    const novos = [...sensores];
    novos[idx] = value;
    setSensores(novos);
  };

  const adicionarCampoSensor = () => {
    if (sensores.length < 3) {
      setSensores([...sensores, ""]);
    }
  };

  const removerCampoSensor = (idx) => {
    if (sensores.length > 1) {
      const novos = sensores.filter((_, index) => index !== idx);
      setSensores(novos);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const formData = new FormData();
    formData.append("fazendaId", fazendaSelecionada);
    formData.append("id_tipo_camarao", tipoCamarao?.value || "");
    formData.append("data_instalacao", dataInstalacao);
    if (arquivo) formData.append("foto_cativeiro", arquivo);
    formData.append("temp_media_diaria", tempMedia);
    formData.append("ph_medio_diario", phMedio);
    formData.append("amonia_media_diaria", amoniaMedia);
    
    // Adiciona todos os sensores selecionados (máximo 3)
    const sensoresSelecionados = sensores.filter(sensor => sensor && sensor !== "");
    if (sensoresSelecionados.length > 0) {
      // Envia como array para suportar múltiplos sensores
      sensoresSelecionados.forEach((sensorId) => {
        formData.append("sensorIds", sensorId);
      });
      console.log('🔗 Sensores relacionados na edição:', sensoresSelecionados);
    }
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await axios.put(`${apiUrl}/cativeiros/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      // Verifica se sensores foram relacionados
      const sensoresSelecionados = sensores.filter(sensor => sensor && sensor !== "");
      const message = sensoresSelecionados.length > 0 
        ? `Cativeiro atualizado com sucesso! ${sensoresSelecionados.length} sensor(es) relacionado(s) automaticamente.`
        : "Cativeiro atualizado com sucesso!";
      
      showNotification(message);
      // Aguardar 2 segundos antes de redirecionar para a notificação aparecer
      setTimeout(() => {
        router.push("/home");
      }, 2000);
    } catch {
      showNotification("Erro ao atualizar cativeiro.", 'error');
    }
  };

  if (loading || !dataLoaded) {
    return (
      <div className={styles.createWrapper}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Carregando dados do cativeiro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.createWrapper}>
      <button className={styles.backBtn} onClick={() => router.back()}>
        <span style={{ fontSize: 24, lineHeight: 1 }}>&larr;</span>
      </button>
      <form className={styles.formBox} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Editar cativeiro</h2>
        <select
          className={`${styles.input} ${styles.inputSelect}`}
          value={fazendaSelecionada}
          onChange={e => setFazendaSelecionada(e.target.value)}
        >
          <option value="">Selecione o sítio</option>
          {fazendas.map(f => (
            <option key={f._id} value={f._id.toString()}>
              {f.nome} - {f.codigo}
            </option>
          ))}
        </select>
        <div className={styles.inputIconBox}>
          <input
            className={styles.input}
            placeholder="Data da instalação"
            type="date"
            value={dataInstalacao}
            onChange={e => setDataInstalacao(e.target.value)}
          />
        </div>
        <div style={{ width: '100%' }}>
          <SelectTipoCamarao
            value={tipoCamarao}
            onChange={option => setTipoCamarao(option)}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <h4 style={{ margin: '0 0 8px 0', fontWeight: 600, fontSize: '1.08rem' }}>Condições Ideais</h4>
        </div>
        <div className={styles.mediaInputs}>
          <input
            className={styles.input}
            placeholder="Temperatura"
            type="number"
            step="0.1"
            min="0"
            value={tempMedia}
            onChange={e => setTempMedia(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="pH"
            type="number"
            step="0.1"
            min="0"
            max="14"
            value={phMedio}
            onChange={e => setPhMedio(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="Amônia"
            type="number"
            step="0.01"
            min="0"
            value={amoniaMedia}
            onChange={e => setAmoniaMedia(e.target.value)}
          />
        </div>
        <div className={styles.uploadBox}>
          <button type="button" className={styles.uploadBtn} onClick={() => fileInputRef.current.click()}>
            &#128206; Selecionar foto
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={e => setArquivo(e.target.files[0])}
          />
          <span className={styles.uploadFileName}>
            {arquivo ? arquivo.name : (currentImageUrl ? "Foto atual" : "Nenhum arquivo inserido")}
          </span>
          {currentImageUrl && !arquivo && (
            <div style={{ marginTop: '8px' }}>
              <img 
                src={currentImageUrl} 
                alt="Foto atual do cativeiro" 
                style={{ 
                  maxWidth: '100px', 
                  maxHeight: '100px', 
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }} 
              />
            </div>
          )}
        </div>
        <hr className={styles.hr} />
        <h3 className={styles.subtitle}>Relacione os sensores</h3>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px', gridColumn: '1 / -1' }}>
          Todos os sensores selecionados serão relacionados ao cativeiro automaticamente (máximo 3 sensores).
        </p>
        {sensores.map((sensor, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              className={`${styles.input} ${styles.inputSelect}`}
              value={sensor}
              onChange={e => handleSensorChange(idx, e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Selecione</option>
              {sensoresDisponiveis
                .filter(s => {
                  // Mostra o sensor se ele está selecionado neste campo OU se não está selecionado em nenhum outro campo
                  return sensor === s._id || !sensores.includes(s._id);
                })
                .map(s => (
                  <option key={s._id} value={s._id}>
                    {s.apelido ? `${s.apelido} (${s.id_tipo_sensor})` : s.id_tipo_sensor || s._id}
                  </option>
                ))}
            </select>
            {sensores.length > 1 && (
              <button
                type="button"
                onClick={() => removerCampoSensor(idx)}
                style={{
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {sensores.length < 3 && (
          <button
            type="button"
            onClick={adicionarCampoSensor}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '8px'
            }}
          >
            + Adicionar Sensor
          </button>
        )}
        <button type="submit" className={styles.cadastrarBtn}>
          Atualizar
        </button>
      </form>
      <div className={styles.logoBox}>
        <img src="/images/logo_camarize1.png" alt="Camarize Logo" />
      </div>
      <Notification
        isVisible={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );
} 