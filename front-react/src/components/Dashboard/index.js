import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import MemberLayout from "../MemberLayout";
import Modal from "../Modal";
import panelStyles from "@/styles/panel.module.css";

const SENSOR_CFG = [
  { key: 'temperatura',  label: 'Temperatura',  unit: '°C',    decimals: 1, icon: '🌡️', stripe: '#f97316', bg: '#fff7ed', badgeColor: '#c2410c' },
  { key: 'ph',           label: 'pH',            unit: '',      decimals: 1, icon: '🧪', stripe: '#3b82f6', bg: '#eff6ff', badgeColor: '#1d4ed8' },
  { key: 'amonia',       label: 'Amônia total',  unit: ' mg/L', decimals: 2, icon: '⚗️', stripe: '#a855f7', bg: '#fdf4ff', badgeColor: '#7e22ce' },
  { key: 'amoniaLivre',  label: 'NH₃ livre',     unit: ' mg/L', decimals: 2, icon: '⚗️', stripe: '#7c3aed', bg: '#f5f3ff', badgeColor: '#5b21b6' },
];

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function normalizeSerie(values, chartH, padTop, padBot) {
  const nums = values.filter(v => typeof v === 'number');
  let min = nums.length ? Math.min(...nums) : 0;
  let max = nums.length ? Math.max(...nums) : 1;
  if (min === max) { min -= 0.5; max += 0.5; }
  const usable = chartH - padTop - padBot;
  return values.map(v => {
    const n = typeof v === 'number' ? v : (min + max) / 2;
    return padTop + (1 - (n - min) / (max - min)) * usable;
  });
}

export default function Dashboard() {
  const router = useRouter();
  const { id } = router.query;

  const [dadosAtuais, setDadosAtuais]   = useState(null);
  const [dadosSemanais, setDadosSemanais] = useState([]);
  const [nomeCativeiro, setNomeCativeiro] = useState('');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [showRelatorio, setShowRelatorio] = useState(false);

  const buscar = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== 'undefined'
        ? (sessionStorage.getItem('token') || localStorage.getItem('token'))
        : null;
      if (!token) { setError('Token não encontrado. Faça login novamente.'); return; }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const { data } = await axios.get(`${apiUrl}/parametros/dashboard/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDadosAtuais(data.dadosAtuais);
      setDadosSemanais(data.dadosSemanais || []);
      setNomeCativeiro(data.cativeiro?.nome || '');
    } catch (err) {
      setError(err.response?.status === 401
        ? 'Sessão expirada. Faça login novamente.'
        : 'Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) buscar(); }, [id]);

  const fmt = (v, dec, unit) => {
    if (v === '#' || v === null || v === undefined) return '—';
    return typeof v === 'number' ? `${v.toFixed(dec)}${unit}` : String(v);
  };

  const valores = {
    temperatura: dadosAtuais?.temperatura ?? null,
    ph:          dadosAtuais?.ph          ?? null,
    amonia:      dadosAtuais?.amonia      ?? null,
    amoniaLivre: typeof dadosAtuais?.amonia === 'number' ? dadosAtuais.amonia * 0.2 : null,
  };

  // Série semanal — padeia com valor padrão se faltar dados
  const padTo7 = (campo, padrao) => {
    const base = dadosSemanais.length > 0
      ? dadosSemanais.map(d => { const v = d[campo]; return (v === '#' || v == null) ? padrao : v; })
      : Array(7).fill(padrao);
    while (base.length < 7) base.unshift(padrao);
    return base.slice(-7);
  };
  const tempSerie  = padTo7('temperatura', 26);
  const phSerie    = padTo7('ph', 7.5);
  const amoniaSerie = padTo7('amonia', 0.05);

  // Chart SVG
  const SVG_W = 340, SVG_H = 120, PAD_L = 28, PAD_R = 12, PAD_T = 10, PAD_BOT = 22;
  const chartW = SVG_W - PAD_L - PAD_R;
  const stepX  = chartW / 6;
  const xOf    = (i) => PAD_L + i * stepX;
  const tempY   = normalizeSerie(tempSerie,  SVG_H, PAD_T, PAD_BOT);
  const phY     = normalizeSerie(phSerie,    SVG_H, PAD_T, PAD_BOT);
  const amoniaY = normalizeSerie(amoniaSerie, SVG_H, PAD_T, PAD_BOT);
  const pts     = (yArr) => yArr.map((y, i) => `${xOf(i).toFixed(1)},${y.toFixed(1)}`).join(' ');

  if (loading) {
    return (
      <MemberLayout title={nomeCativeiro || 'Dashboard'} subtitle="Dados em tempo real">
        <div className={panelStyles.loadingScreen} style={{ minHeight: 'unset', padding: '60px 0' }}>
          Carregando dados do cativeiro...
        </div>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <MemberLayout title="Dashboard" subtitle="Dados em tempo real">
        <div className={panelStyles.emptyState}>
          <div className={panelStyles.emptyStateIcon}>⚠️</div>
          <p className={panelStyles.emptyStateText}>{error}</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className={`${panelStyles.btn} ${panelStyles.btnSecondary}`} onClick={() => router.push('/home')}>← Voltar</button>
            <button className={`${panelStyles.btn} ${panelStyles.btnPrimary}`} onClick={buscar}>Tentar novamente</button>
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout title={nomeCativeiro || 'Dashboard'} subtitle="Parâmetros monitorados em tempo real">
      <div className={panelStyles.section}>

        {/* Cabeçalho da seção */}
        <div className={panelStyles.sectionHeader} style={{ marginBottom: 20 }}>
          <div>
            <h2 className={panelStyles.sectionTitle}>Leituras Atuais</h2>
            {!dadosAtuais && (
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Sem leituras recentes dos sensores
              </p>
            )}
          </div>
          <div className={panelStyles.sectionActions}>
            <button
              className={`${panelStyles.btn} ${panelStyles.btnSecondary} ${panelStyles.btnSm}`}
              onClick={() => router.push('/home')}
              title="Voltar para cativeiros"
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </button>
            <button
              className={`${panelStyles.btn} ${panelStyles.btnSecondary} ${panelStyles.btnSm}`}
              onClick={buscar}
              title="Atualizar dados"
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Atualizar
            </button>
            <button
              className={`${panelStyles.btn} ${panelStyles.btnPrimary} ${panelStyles.btnSm}`}
              onClick={() => setShowRelatorio(true)}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <rect x="4" y="18" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
              Relatório
            </button>
          </div>
        </div>

        {/* Cards dos sensores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12, marginBottom: 24 }}>
          {SENSOR_CFG.map(cfg => {
            const raw = valores[cfg.key];
            const valorFmt = fmt(raw, cfg.decimals, cfg.unit);
            const semDados = valorFmt === '—';
            return (
              <div
                key={cfg.key}
                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
              >
                <div style={{ height: 4, background: cfg.stripe }} />
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontSize: semDados ? '0.9rem' : '1.55rem', fontWeight: 700, color: semDados ? '#94a3b8' : cfg.badgeColor, lineHeight: 1.2, marginTop: 2 }}>
                      {valorFmt}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráfico de tendência semanal */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>Tendência Semanal</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>Últimos 7 dias — escala normalizada por parâmetro</div>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: '0.72rem', fontWeight: 600 }}>
              <span style={{ color: '#f97316' }}>▬ Temp.</span>
              <span style={{ color: '#3b82f6' }}>▬ pH</span>
              <span style={{ color: '#a855f7' }}>▬ NH₃</span>
            </div>
          </div>

          <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ overflow: 'visible', display: 'block' }}>
            {/* Linhas guia horizontais */}
            {[0.25, 0.5, 0.75].map(f => {
              const y = PAD_T + f * (SVG_H - PAD_T - PAD_BOT);
              return <line key={f} x1={PAD_L} y1={y} x2={SVG_W - PAD_R} y2={y} stroke="#f1f5f9" strokeWidth="1" />;
            })}

            {/* Linha base */}
            <line x1={PAD_L} y1={SVG_H - PAD_BOT} x2={SVG_W - PAD_R} y2={SVG_H - PAD_BOT} stroke="#e2e8f0" strokeWidth="1" />

            {/* Temperatura */}
            <polyline fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pts(tempY)} />
            {tempY.map((y, i) => <circle key={i} cx={xOf(i)} cy={y} r="3" fill="#f97316" />)}

            {/* pH */}
            <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pts(phY)} />
            {phY.map((y, i) => <circle key={i} cx={xOf(i)} cy={y} r="3" fill="#3b82f6" />)}

            {/* Amônia */}
            <polyline fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pts(amoniaY)} />
            {amoniaY.map((y, i) => <circle key={i} cx={xOf(i)} cy={y} r="3" fill="#a855f7" />)}

            {/* Labels do eixo X */}
            {DIAS.map((d, i) => (
              <text key={d} x={xOf(i)} y={SVG_H - 5} fontSize="10" textAnchor="middle" fill="#94a3b8" fontFamily="Poppins, sans-serif">{d}</text>
            ))}
          </svg>
        </div>

      </div>

      {/* Modal de Relatório */}
      <Modal isOpen={showRelatorio} onClose={() => setShowRelatorio(false)} title="Relatório Individual" showCloseButton>
        <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.5 }}>
          Selecione o período para o relatório de <strong>{nomeCativeiro}</strong>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { key: 'dia',    label: '📅 Relatório Diário',   sub: 'Últimas 24h' },
            { key: 'semana', label: '📊 Relatório Semanal',  sub: 'Últimos 7 dias' },
            { key: 'mes',    label: '📈 Relatório Mensal',   sub: 'Últimos 30 dias' },
          ].map(({ key, label, sub }) => (
            <button
              key={key}
              onClick={() => { setShowRelatorio(false); router.push(`/rel-individual/${id}?periodo=${key}`); }}
              className={`${panelStyles.btn} ${panelStyles.btnPrimary}`}
              style={{ width: '100%', justifyContent: 'space-between', padding: '14px 18px', fontSize: '0.9rem' }}
            >
              <span>{label}</span>
              <span style={{ opacity: 0.75, fontSize: '0.8rem' }}>{sub}</span>
            </button>
          ))}
        </div>
      </Modal>
    </MemberLayout>
  );
}
