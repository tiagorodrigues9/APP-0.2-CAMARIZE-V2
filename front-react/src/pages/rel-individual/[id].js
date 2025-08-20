import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import profileStyles from "../../components/ProfileContent/ProfileContent.module.css";
import Modal from '../../components/Modal';

const mockResumo = `Durante o período de monitoramento do tanque de camarão, foram observadas variações significativas nos parâmetros ambientais essenciais para a saúde e o bem-estar dos crustáceos. A equipe de monitoramento conduziu análises rigorosas e implementou medidas corretivas para garantir um ambiente aquático estável e propício ao crescimento saudável dos camarões.\n\nTemperatura:\nA temperatura média registrada no tanque durante o período de monitoramento foi de 29,75°C. Observou-se uma leve variação diurna, com picos máximos de até 29,5°C durante as horas mais quentes do dia e mínimos de 26°C durante a noite. Essas variações foram mantidas dentro dos limites aceitáveis para as espécies de camarão cultivada, garantindo um ambiente termicamente estável.\n\nNíveis de Amônia:\nOs níveis de amônia foram monitorados de perto, com uma média de 0,25 ppm (partes por milhão) durante o período de observação. Foram observadas pequenas flutuações nos níveis de amônia, principalmente em resposta às atividades de alimentação dos camarões e à decomposição orgânica no tanque. No entanto, medidas de controle eficazes foram implementadas para manter a amônia dentro dos limites seguros, promovendo a saúde dos animais.\n\npH da Água:\nO pH da água foi mantido em um intervalo ideal entre 7,5 e 8,0 ao longo do período de monitoramento. Esta faixa de pH é crucial para garantir um ambiente estável e favorável ao crescimento saudável dos camarões. O uso de tampões naturais e o controle dos valores ótimos foram fundamentais para evitar oscilações abruptas e manter as condições tamponeantes, garantindo a estabilidade do pH do sistema.\n\nConclusão:\nO monitoramento contínuo e a gestão proativa dos parâmetros ambientais são ações fundamentais para manter a saúde e a produtividade do cativeiro de camarão. A equipe de operação é munida continuamente de orientações baseadas em dados e segue as melhores condutas de manejo do ambiente para garantir a eficiência sustentável e o sucesso da operação de criação de camarão.\n\nEste relatório destina-se exclusivamente à equipe de gestão e operação do tanque de camarão e não deve ser reproduzido ou distribuído sem autorização prévia.`;

export default function RelatorioIndividual() {
  const router = useRouter();
  const { id, periodo: periodoFromQuery } = router.query;
  const [cativeiro, setCativeiro] = useState(null);
  const [fotoUrl, setFotoUrl] = useState("/images/cativeiro1.jpg");
  const relatorioRef = useRef();
  const [periodo, setPeriodo] = useState(null);
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);

  useEffect(() => {
    async function fetchCativeiro() {
      if (!id) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await axios.get(`${apiUrl}/cativeiros/${id}`);
        setCativeiro(res.data);
        console.log('Cativeiro carregado:', res.data);
        
        // Processar imagem do cativeiro
        if (res.data?.foto_cativeiro && res.data.foto_cativeiro.data) {
          try {
            console.log('Processando imagem do cativeiro:', {
              hasData: !!res.data.foto_cativeiro.data,
              dataType: typeof res.data.foto_cativeiro.data,
              isArray: Array.isArray(res.data.foto_cativeiro.data),
              dataLength: res.data.foto_cativeiro.data?.length || 'N/A',
              dataSample: Array.isArray(res.data.foto_cativeiro.data) ? res.data.foto_cativeiro.data.slice(0, 5) : 'N/A'
            });
            
            // Converter buffer para base64 - lidar com diferentes formatos do MongoDB
            let binary = '';
            let imageData = res.data.foto_cativeiro.data;
            
            // Verificar se os dados são válidos
            if (!imageData || (Array.isArray(imageData) && imageData.length === 0)) {
              console.error('Dados da imagem inválidos ou vazios');
              setFotoUrl("/images/logo_camarize1.png");
              return;
            }
            
            // MongoDB pode retornar os dados em diferentes formatos
            if (Array.isArray(imageData)) {
              // Se for um array (formato mais comum)
              console.log('Processando como array, length:', imageData.length);
              for (let i = 0; i < imageData.length; i++) {
                binary += String.fromCharCode(imageData[i]);
              }
            } else if (imageData && typeof imageData === 'object' && imageData.buffer) {
              // Se for um objeto com buffer (formato Buffer do Node.js)
              console.log('Processando como objeto com buffer');
              const bytes = new Uint8Array(imageData.buffer);
              for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
            } else if (imageData instanceof ArrayBuffer) {
              // Se for ArrayBuffer
              console.log('Processando como ArrayBuffer');
              const bytes = new Uint8Array(imageData);
              for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
            } else if (imageData && typeof imageData === 'object' && imageData.data) {
              // Se for um objeto com propriedade data
              console.log('Processando como objeto com propriedade data');
              const data = imageData.data;
              if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                  binary += String.fromCharCode(data[i]);
                }
              } else if (data instanceof ArrayBuffer) {
                const bytes = new Uint8Array(data);
                for (let i = 0; i < bytes.length; i++) {
                  binary += String.fromCharCode(bytes[i]);
                }
              }
            } else {
              // Tentar converter como Uint8Array
              console.log('Processando como Uint8Array');
              const bytes = new Uint8Array(imageData);
              for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
            }
            
            if (binary.length > 0) {
              const base64String = btoa(binary);
              const imageUrl = `data:image/jpeg;base64,${base64String}`;
              setFotoUrl(imageUrl);
              console.log('Imagem convertida com sucesso, tamanho:', binary.length, 'bytes');
            } else {
              console.error('Falha na conversão: binary está vazio');
              setFotoUrl("/images/logo_camarize1.png");
            }
          } catch (error) {
            console.error('Erro ao processar imagem do cativeiro:', error);
            console.error('Error details:', error.message);
            setFotoUrl("/images/logo_camarize1.png");
          }
        } else {
          console.log('Nenhuma imagem encontrada para o cativeiro, usando imagem padrão');
          console.log('foto_cativeiro:', res.data?.foto_cativeiro);
          setFotoUrl("/images/logo_camarize1.png");
        }
      } catch (err) {
        setCativeiro(null);
        console.error('Erro ao buscar cativeiro:', err);
      }
    }
    
    if (router.isReady && id) {
      fetchCativeiro();
    }
  }, [id, router.isReady]);

  useEffect(() => {
    // Se o período vier da URL, use ele
    if (periodoFromQuery) {
      setPeriodo(periodoFromQuery);
      setShowPeriodoModal(false);
    } else if (!periodo) {
      setShowPeriodoModal(true);
    } else {
      setShowPeriodoModal(false);
    }
  }, [periodo, periodoFromQuery]);

  // Se não houver periodo, apenas mostre uma mensagem simples
  if (!periodo) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h2>Período não selecionado</h2>
        <p>Por favor, volte e selecione um período para o relatório.</p>
        <button onClick={() => window.history.back()} style={{ marginTop: 16, padding: '8px 18px', borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Voltar</button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleSavePDF = async () => {
    if (typeof window !== 'undefined') {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       [0.5, 0.5, 1, 0.5],
        filename:     `relatorio-cativeiro-${id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };
      html2pdf().set(opt).from(relatorioRef.current).save();
    }
  };

  const handlePeriodoSelect = (selectedPeriodo) => {
    setPeriodo(selectedPeriodo);
    setShowPeriodoModal(false);
    // Atualiza a URL sem recarregar a página
    router.replace(`/rel-individual/${id}?periodo=${selectedPeriodo}`, undefined, { shallow: true });
  };

  const handleCloseModal = () => {
    setShowPeriodoModal(false);
    // Se não há período selecionado, volta para a página anterior
    if (!periodo) {
      window.history.back();
    }
  };

  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto' }}>
      {/* Modal de seleção de período */}
      <Modal 
        isOpen={showPeriodoModal}
        onClose={handleCloseModal}
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #f7b0b7 0%, #a3c7f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="10,9 9,9 8,9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Relatório Individual</span>
          </div>
        }
        showCloseButton={true}
      >
        {/* Descrição */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <p style={{
            margin: '0',
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            Selecione o período para gerar o relatório detalhado do cativeiro <strong>{cativeiro?.nome || `Tanque ${id}`}</strong>
          </p>
        </div>

        {/* Opções de período */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button 
            onClick={() => handlePeriodoSelect('dia')}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: 'linear-gradient(90deg, #f7b0b7 0%, #a3c7f7 100%)',
              color: '#1f2937',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(247, 176, 183, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span>📅 Relatório Diário</span>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>Últimas 24h</span>
          </button>

          <button 
            onClick={() => handlePeriodoSelect('semana')}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: 'linear-gradient(90deg, #f7b0b7 0%, #a3c7f7 100%)',
              color: '#1f2937',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(247, 176, 183, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span>📊 Relatório Semanal</span>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>Últimos 7 dias</span>
          </button>

          <button 
            onClick={() => handlePeriodoSelect('mes')}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: 'linear-gradient(90deg, #f7b0b7 0%, #a3c7f7 100%)',
              color: '#1f2937',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(247, 176, 183, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span>📈 Relatório Mensal</span>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>Últimos 30 dias</span>
          </button>
        </div>
      </Modal>

      <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'relative' }}>
        <button className={profileStyles.backBtn} onClick={() => window.history.back()} style={{ position: 'absolute', top: 16, left: 16 }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>&larr;</span>
        </button>
      <div ref={relatorioRef}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <img src="/images/logo_camarize1.png" alt="Camarize Logo" style={{ height: 48, marginBottom: 8 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, textAlign: 'center' }}>RELATÓRIO INDIVIDUAL DETALHADO</h2>
        </div>
        <h3 style={{ textAlign: 'center', margin: '24px 0 8px 0' }}>{cativeiro?.nome || `Tanque ${id}`}</h3>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <img src={fotoUrl} alt="Tanque" style={{ width: 320, height: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
        </div>
        <p style={{ textAlign: 'center', marginBottom: 24 }}>
          Período de Monitoramento: {periodo === 'dia' ? 'Últimas 24 horas' : 
                                   periodo === 'semana' ? 'Últimos 7 dias' : 
                                   periodo === 'mes' ? 'Últimos 30 dias' : 'Período selecionado'}
        </p>
        <div style={{ whiteSpace: 'pre-line', fontSize: 15, marginBottom: 32, pageBreakInside: 'avoid' }}>
          {mockResumo}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button onClick={handlePrint} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          Imprimir
        </button>
        <button onClick={handleSavePDF} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#43a047', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          Salvar como PDF
        </button>
      </div>
    </div>
    </div>
  );
} 