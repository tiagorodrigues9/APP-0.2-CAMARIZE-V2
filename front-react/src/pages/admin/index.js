import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';

const CreatableSelect = dynamic(() => import('react-select/creatable'), { ssr: false });

export default function AdminPanel() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [initialTabApplied, setInitialTabApplied] = useState(false);
  const [items, setItems] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [cativeiros, setCativeiros] = useState([]);
  const [fazendas, setFazendas] = useState([]);
  const [tiposCamarao, setTiposCamarao] = useState([]);
  const [condicoesIdeais, setCondicoesIdeais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('cativeiros'); // requests | solicitacoes | cativeiros
  const [requesterFilter, setRequesterFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedFazenda, setExpandedFazenda] = useState({}); // id -> bool
  const [expandedCativeiro, setExpandedCativeiro] = useState({}); // id -> bool
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCativeiro, setNewCativeiro] = useState({
    fazendaId: '',
    nome: '',
    id_tipo_camarao: '',
    data_instalacao: '',
    temp_media_diaria: '',
    ph_medio_diario: '',
    amonia_media_diaria: ''
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const getToken = () => (typeof window !== 'undefined' ? (sessionStorage.getItem('token') || localStorage.getItem('token')) : null);

  const load = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [reqs, fzs, cats, tipos, condicoes] = await Promise.all([
        axios.get(`${apiUrl}/requests`, { headers }),
        axios.get(`${apiUrl}/fazendas`, { headers }),
        axios.get(`${apiUrl}/cativeiros`, { headers }),
        axios.get(`${apiUrl}/camaroes`, { headers }),
        axios.get(`${apiUrl}/condicoes-ideais`, { headers }),
      ]);
      setItems(reqs.data);
      setFazendas(fzs.data);
      setCativeiros(cats.data);
      setTiposCamarao(tipos.data);
      setCondicoesIdeais(condicoes.data);
    } catch (e) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadAllRequests = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${apiUrl}/requests/all-admin`, { headers });
      return response.data;
    } catch (e) {
      console.error('Erro ao carregar requests dos funcionários:', e);
      return [];
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      load();
    }
  }, [authLoading, isAuthenticated]);

  // Respeitar query ?tab=... para abrir diretamente a aba correspondente
  useEffect(() => {
    if (typeof window === 'undefined' || initialTabApplied) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const qTab = params.get('tab');
      if (qTab && ['requests', 'solicitacoes', 'cativeiros'].includes(qTab)) {
        setTab(qTab);
      }
      setInitialTabApplied(true);
    } catch {}
  }, [initialTabApplied]);

  useEffect(() => {
    if (tab === 'requests' && isAuthenticated) {
      loadAllRequests().then(setAllRequests);
    }
  }, [tab, isAuthenticated]);

  useEffect(() => {
    let filtered = [...allRequests];
    if (requesterFilter) {
      filtered = filtered.filter(item =>
        item.requesterUser?.nome?.toLowerCase().includes(requesterFilter.toLowerCase()) ||
        item.requesterUser?.email?.toLowerCase().includes(requesterFilter.toLowerCase())
      );
    }
    if (dateFilter) {
      const [year, month, day] = dateFilter.split('-').map(Number);
      const filterDate = new Date(year, month - 1, day);
      const fy = filterDate.getFullYear();
      const fm = filterDate.getMonth();
      const fd = filterDate.getDate();
      filtered = filtered.filter(item => {
        const d = new Date(item.createdAt);
        return d.getFullYear() === fy && d.getMonth() === fm && d.getDate() === fd;
      });
    }
    setFilteredRequests(filtered);
  }, [allRequests, requesterFilter, dateFilter]);

  const groupedByFazenda = () => {
    const map = {};
    // seed com todas as fazendas para aparecer mesmo sem cativeiros
    fazendas.forEach(f => { map[String(f._id)] = []; });
    
    cativeiros.forEach(c => {
      // tenta várias chaves possíveis de vínculo e normaliza para string
      const raw = c.fazenda?._id || c.fazendaId || c.fazenda || c.fazenda_id;
      const fallback = fazendas[0]?._id ? String(fazendas[0]._id) : '';
      const fzId = raw ? String(raw) : fallback;
      
      if (!map[fzId]) map[fzId] = [];
      map[fzId].push(c);
    });
    
    return map;
  };

  const getFazendaName = (id) => {
    const idStr = String(id);
    const f = fazendas.find(fz => String(fz._id) === idStr);
    if (!f) return 'Sem fazenda';
    return f.nome && f.codigo ? `${f.nome} - ${f.codigo}` : (f.nome || f.codigo || id);
  };

  const updateCativeiroNome = async (id, nome) => {
    const token = getToken();
    await axios.patch(`${apiUrl}/cativeiros/${id}`, { nome }, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  const updateCativeiroTipoCamarao = async (id, id_tipo_camarao) => {
    const token = getToken();
    await axios.patch(`${apiUrl}/cativeiros/${id}`, { id_tipo_camarao }, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  const updateCativeiroCondicoesIdeais = async (id, condicoes_ideais) => {
    const token = getToken();
    const cativeiro = cativeiros.find(c => c._id === id);
    if (!cativeiro) return;
    
    // Enviar os dados das condições ideais diretamente
    const data = {
      temp_media_diaria: condicoes_ideais?.temp_ideal || '',
      ph_medio_diario: condicoes_ideais?.ph_ideal || '',
      amonia_media_diaria: condicoes_ideais?.amonia_ideal || ''
    };
    
    await axios.patch(`${apiUrl}/cativeiros/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  const act = async (id, op) => {
    const token = getToken();
    await axios.post(`${apiUrl}/requests/${id}/${op}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  const applyAndApprove = async (item) => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const { action, payload, _id } = item;
      if (action === 'editar_cativeiro' && payload?.cativeiroId) {
        const body = {};
        if (typeof payload.nome !== 'undefined') body.nome = payload.nome;
        if (typeof payload.id_tipo_camarao !== 'undefined') body.id_tipo_camarao = payload.id_tipo_camarao;
        if (typeof payload.temp_media_diaria !== 'undefined') body.temp_media_diaria = payload.temp_media_diaria;
        if (typeof payload.ph_medio_diario !== 'undefined') body.ph_medio_diario = payload.ph_medio_diario;
        if (typeof payload.amonia_media_diaria !== 'undefined') body.amonia_media_diaria = payload.amonia_media_diaria;
        if (Object.keys(body).length === 0) {
          alert('Nada para aplicar neste request.');
          return;
        }
        await axios.patch(`${apiUrl}/cativeiros/${payload.cativeiroId}`, body, { headers });
      } else if (action === 'editar_sensor' && payload?.id && payload?.apelido) {
        await axios.patch(`${apiUrl}/sensores/${payload.id}`, { apelido: payload.apelido }, { headers });
      } else {
        alert('Este tipo de solicitação não é leve ou falta informação.');
        return;
      }
      await act(_id, 'approve');
    } catch (e) {
      alert('Falha ao aplicar alteração: ' + (e?.response?.data?.error || e.message));
    }
  };

  const solicitarCriacaoCativeiro = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      const payload = {
        fazendaId: newCativeiro.fazendaId,
        nome: newCativeiro.nome,
        id_tipo_camarao: newCativeiro.id_tipo_camarao,
        data_instalacao: newCativeiro.data_instalacao,
        temp_media_diaria: newCativeiro.temp_media_diaria,
        ph_medio_diario: newCativeiro.ph_medio_diario,
        amonia_media_diaria: newCativeiro.amonia_media_diaria
      };

      await axios.post(`${apiUrl}/requests`, {
        action: 'cadastrar_cativeiro',
        payload: payload,
        fazenda: newCativeiro.fazendaId
      }, { headers });

      alert('Solicitação de criação de cativeiro enviada para o Master!');
      setShowCreateModal(false);
      setNewCativeiro({
        fazendaId: '',
        nome: '',
        id_tipo_camarao: '',
        data_instalacao: '',
        temp_media_diaria: '',
        ph_medio_diario: '',
        amonia_media_diaria: ''
      });
      await load();
    } catch (e) {
      alert('Erro ao enviar solicitação: ' + (e?.response?.data?.error || e.message));
    }
  };

  const localRole = typeof window !== 'undefined' ? (JSON.parse(sessionStorage.getItem('usuarioCamarize') || localStorage.getItem('usuarioCamarize') || '{}')?.role) : undefined;
  const effectiveRole = user?.role || localRole;
  if (authLoading || loading) return <div style={{ padding: 20 }}>Carregando...</div>;
  if (!isAuthenticated) return <div style={{ padding: 20, color: 'red' }}>Sessão expirada. Faça login novamente.</div>;
  if (!effectiveRole) return <div style={{ padding: 20 }}>Carregando permissões...</div>;
  if (effectiveRole !== 'admin' && effectiveRole !== 'master') return <div style={{ padding: 20, color: 'red' }}>Acesso restrito ao Admin.</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Painel do Admin</h2>
        <button
          onClick={() => {
            try {
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('usuarioCamarize');
              localStorage.removeItem('token');
              localStorage.removeItem('usuarioCamarize');
            } catch {}
            window.location.href = '/login';
          }}
          style={{ border: '1px solid #eee', background: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}
          title="Sair"
        >
          Sair
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button onClick={() => setTab('requests')} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: tab==='requests'?'#eef':'#fff' }}>Requests</button>
        <button onClick={() => setTab('solicitacoes')} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: tab==='solicitacoes'?'#eef':'#fff' }}>Solicitações</button>
        <button onClick={() => setTab('cativeiros')} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: tab==='cativeiros'?'#eef':'#fff' }}>Cativeiros</button>
      </div>

      {tab === 'requests' && (
        <section>
          <h3>Histórico de Requests dos Funcionários</h3>
          <div style={{
            display: 'flex', gap: 12, marginBottom: 16, padding: 12, background: '#f9fafb', borderRadius: 8, alignItems: 'center', flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Solicitante:</label>
              <input
                type="text"
                placeholder="Nome ou email..."
                value={requesterFilter}
                onChange={(e) => setRequesterFilter(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '14px', minWidth: '200px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Data:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '14px' }}
              />
            </div>
            <button
              onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
              style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '14px' }}
            >
              Hoje
            </button>
            <button
              onClick={() => { setRequesterFilter(''); setDateFilter(''); }}
              style={{ padding: '6px 12px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '14px' }}
            >
              Limpar Filtros
            </button>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {filteredRequests.length} de {allRequests.length} requests
            </div>
          </div>

          {filteredRequests.length === 0 && allRequests.length > 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>Nenhum request encontrado com os filtros aplicados.</div>
          )}
          {filteredRequests.length === 0 && allRequests.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>Nenhum request encontrado.</div>
          )}

          {filteredRequests.map(item => (
            <div key={item._id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 10, borderRadius: 6, background: item.status === 'aprovado' ? '#f0fdf4' : item.status === 'recusado' ? '#fef2f2' : '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <strong>Solicitante:</strong> {item.requesterUser?.nome || 'N/A'} ({item.requesterUser?.email || 'N/A'})
                </div>
                <div style={{ padding: '4px 8px', borderRadius: 4, fontSize: '12px', background: item.status === 'aprovado' ? '#dcfce7' : item.status === 'recusado' ? '#fee2e2' : '#fef3c7', color: item.status === 'aprovado' ? '#166534' : item.status === 'recusado' ? '#991b1b' : '#92400e' }}>
                  {item.status === 'aprovado' ? '✅ Aprovado' : item.status === 'recusado' ? '❌ Recusado' : '⏳ Pendente'}
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Ação:</strong> {item.action}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Data:</strong> {new Date(item.createdAt).toLocaleString('pt-BR')}
              </div>
              {item.payload && Object.keys(item.payload).length > 0 && (
                <div>
                  <strong>Detalhes:</strong>
                  <pre style={{ background: '#f9fafb', padding: 8, borderRadius: 4, fontSize: '12px', marginTop: 4, overflow: 'auto', maxHeight: '200px' }}>{JSON.stringify(item.payload, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {tab === 'solicitacoes' && (
        <section>
          <h3>Solicitações leves dos funcionários</h3>
          {items.length === 0 && <div>Nenhuma solicitação pendente.</div>}
          {items.map(item => {
            const changedFields = Object.keys(item.payload).filter(key => !['_id', 'cativeiroId', 'sensorId'].includes(key));
            return (
              <div key={item._id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 10 }}>
                <div><b>Solicitante:</b> {item.requester?.nome} ({item.requester?.email})</div>
                <div><b>Ação:</b> {item.action}</div>
                {changedFields.length > 0 && (
                  <div>
                    <b>Alterações solicitadas:</b>
                    <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                      {changedFields.map(field => (
                        <li key={field}>{field}: {JSON.stringify(item.payload[field])}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button onClick={() => applyAndApprove(item)} style={{ marginTop: 8 }}>Aplicar e Aprovar</button>
                <button onClick={() => act(item._id, 'reject')} style={{ marginLeft: 8 }}>Recusar</button>
              </div>
            );
          })}
        </section>
      )}

      {tab === 'cativeiros' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Fazendas e Cativeiros</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Solicitar novo cativeiro
            </button>
          </div>
          {Object.entries(groupedByFazenda()).map(([fzId, cats]) => (
            <div key={fzId} style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 10 }}>
              <div
                onClick={() => setExpandedFazenda(prev => ({ ...prev, [fzId]: !prev[fzId] }))}
                style={{ padding: 10, cursor: 'pointer', background: '#f9fafb', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>{getFazendaName(fzId)}</span>
                <span>{expandedFazenda[fzId] ? '▲' : '▼'}</span>
              </div>
              {expandedFazenda[fzId] && (
                <div style={{ padding: 10 }}>
                  {cats.length === 0 && <div style={{ color: '#888' }}>Nenhum cativeiro nesta fazenda.</div>}
                  {cats.map(cativeiro => (
                    <div key={cativeiro._id} style={{ border: '1px solid #eee', borderRadius: 6, marginBottom: 8, overflow: 'hidden' }}>
                      <div
                        onClick={() => setExpandedCativeiro(prev => ({ ...prev, [cativeiro._id]: !prev[cativeiro._id] }))}
                        style={{ padding: 8, cursor: 'pointer', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span>{cativeiro.nome || cativeiro._id}</span>
                        <span>{expandedCativeiro[cativeiro._id] ? '▲' : '▼'}</span>
                      </div>
                      {expandedCativeiro[cativeiro._id] && (
                        <div style={{ padding: 10 }}>
                          <div style={{ marginBottom: 8 }}>
                            <strong>Tipo de Camarão:</strong>
                            <select
                              value={cativeiro.id_tipo_camarao?._id || cativeiro.id_tipo_camarao || ''}
                              onChange={(e) => {
                                const updatedCativeiros = cativeiros.map(cat =>
                                  cat._id === cativeiro._id ? { ...cat, id_tipo_camarao: e.target.value } : cat
                                );
                                setCativeiros(updatedCativeiros);
                              }}
                              style={{ marginLeft: 8, padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
                            >
                              <option value="">Selecione um tipo</option>
                              {tiposCamarao.map(tipo => (
                                <option key={tipo._id} value={tipo._id}>{tipo.nome}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => updateCativeiroTipoCamarao(cativeiro._id, cativeiro.id_tipo_camarao)} 
                              style={{ marginLeft: 8, background: '#4CAF50', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
                            >
                              Salvar
                            </button>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <strong>Data de Instalação:</strong> {new Date(cativeiro.data_instalacao).toLocaleDateString()}
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <strong>Condições Ideais:</strong>
                            <div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <div>
                                <label style={{ fontSize: '12px', color: '#666' }}>Temperatura (°C):</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={cativeiro.condicoes_ideais?.temp_ideal || ''}
                                  onChange={(e) => {
                                    const updatedCativeiros = cativeiros.map(cat =>
                                      cat._id === cativeiro._id ? { 
                                        ...cat, 
                                        condicoes_ideais: { 
                                          ...cat.condicoes_ideais, 
                                          temp_ideal: parseFloat(e.target.value) || 0 
                                        } 
                                      } : cat
                                    );
                                    setCativeiros(updatedCativeiros);
                                  }}
                                  style={{ width: '80px', padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc', marginLeft: 4 }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '12px', color: '#666' }}>pH:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={cativeiro.condicoes_ideais?.ph_ideal || ''}
                                  onChange={(e) => {
                                    const updatedCativeiros = cativeiros.map(cat =>
                                      cat._id === cativeiro._id ? { 
                                        ...cat, 
                                        condicoes_ideais: { 
                                          ...cat.condicoes_ideais, 
                                          ph_ideal: parseFloat(e.target.value) || 0 
                                        } 
                                      } : cat
                                    );
                                    setCativeiros(updatedCativeiros);
                                  }}
                                  style={{ width: '60px', padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc', marginLeft: 4 }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '12px', color: '#666' }}>Amônia (mg/L):</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={cativeiro.condicoes_ideais?.amonia_ideal || ''}
                                  onChange={(e) => {
                                    const updatedCativeiros = cativeiros.map(cat =>
                                      cat._id === cativeiro._id ? { 
                                        ...cat, 
                                        condicoes_ideais: { 
                                          ...cat.condicoes_ideais, 
                                          amonia_ideal: parseFloat(e.target.value) || 0 
                                        } 
                                      } : cat
                                    );
                                    setCativeiros(updatedCativeiros);
                                  }}
                                  style={{ width: '80px', padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc', marginLeft: 4 }}
                                />
                              </div>
                              <button 
                                onClick={() => updateCativeiroCondicoesIdeais(cativeiro._id, cativeiro.condicoes_ideais)} 
                                style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <strong>Sensores:</strong>
                            {cativeiro.sensores && cativeiro.sensores.length > 0 ? (
                              <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                                {cativeiro.sensores.map(s => (
                                  <li key={s._id}>{s.apelido || s.id_tipo_sensor} ({s.id_tipo_sensor})</li>
                                ))}
                              </ul>
                            ) : ' Nenhum sensor associado.'}
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <input
                              type="text"
                              value={cativeiro.nome}
                              onChange={(e) => {
                                const updatedCativeiros = cativeiros.map(cat =>
                                  cat._id === cativeiro._id ? { ...cat, nome: e.target.value } : cat
                                );
                                setCativeiros(updatedCativeiros);
                              }}
                              style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc' }}
                            />
                            <button onClick={() => updateCativeiroNome(cativeiro._id, cativeiro.nome)} style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Salvar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Modal para solicitar criação de cativeiro */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 8,
            width: '95%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: 16 }}>Solicitar novo cativeiro</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '14px', fontWeight: '500', color: '#374151' }}>Fazenda:</label>
                <select
                  value={newCativeiro.fazendaId}
                  onChange={(e) => setNewCativeiro(prev => ({ ...prev, fazendaId: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '14px' }}
                >
                  <option value="">Selecione uma fazenda</option>
                  {fazendas.map(fazenda => (
                    <option key={fazenda._id} value={fazenda._id}>
                      {fazenda.nome} - {fazenda.codigo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '14px', fontWeight: '500', color: '#374151' }}>Nome do cativeiro:</label>
                <input
                  type="text"
                  value={newCativeiro.nome}
                  onChange={(e) => setNewCativeiro(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Cativeiro A"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '14px', fontWeight: '500', color: '#374151' }}>Tipo de camarão:</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={newCativeiro.id_tipo_camarao}
                    onChange={(e) => setNewCativeiro(prev => ({ ...prev, id_tipo_camarao: e.target.value }))}
                    style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '14px' }}
                  >
                    <option value="">Selecione um tipo</option>
                    {tiposCamarao.map(tipo => (
                      <option key={tipo._id} value={tipo._id}>{tipo.nome}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      const novoNome = prompt('Digite o nome do novo tipo de camarão:');
                      if (novoNome && novoNome.trim()) {
                        try {
                          const token = getToken();
                          const headers = { Authorization: `Bearer ${token}` };
                          const response = await axios.post(`${apiUrl}/camaroes`, { nome: novoNome.trim() }, { headers });
                          setNewCativeiro(prev => ({ ...prev, id_tipo_camarao: response.data._id }));
                          await load(); // Recarrega para incluir o novo tipo
                        } catch (e) {
                          alert('Erro ao criar tipo de camarão: ' + (e?.response?.data?.error || e.message));
                        }
                      }
                    }}
                    style={{
                      padding: '10px 12px',
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: '14px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    + Novo
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '14px', fontWeight: '500', color: '#374151' }}>Data de instalação:</label>
                <input
                  type="date"
                  value={newCativeiro.data_instalacao}
                  onChange={(e) => setNewCativeiro(prev => ({ ...prev, data_instalacao: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '14px', fontWeight: '500', color: '#374151' }}>Condições ideais:</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '120px' }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', color: '#6b7280' }}>Temperatura (°C):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCativeiro.temp_media_diaria}
                      onChange={(e) => setNewCativeiro(prev => ({ ...prev, temp_media_diaria: e.target.value }))}
                      placeholder="26.0"
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ flex: '1', minWidth: '100px' }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', color: '#6b7280' }}>pH:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCativeiro.ph_medio_diario}
                      onChange={(e) => setNewCativeiro(prev => ({ ...prev, ph_medio_diario: e.target.value }))}
                      placeholder="7.5"
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ flex: '1', minWidth: '140px' }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', color: '#6b7280' }}>Amônia (mg/L):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCativeiro.amonia_media_diaria}
                      onChange={(e) => setNewCativeiro(prev => ({ ...prev, amonia_media_diaria: e.target.value }))}
                      placeholder="0.05"
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={solicitarCriacaoCativeiro}
                disabled={!newCativeiro.fazendaId || !newCativeiro.nome || !newCativeiro.id_tipo_camarao}
                style={{
                  padding: '8px 16px',
                  background: newCativeiro.fazendaId && newCativeiro.nome && newCativeiro.id_tipo_camarao ? '#3b82f6' : '#9ca3af',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: newCativeiro.fazendaId && newCativeiro.nome && newCativeiro.id_tipo_camarao ? 'pointer' : 'not-allowed'
                }}
              >
                Solicitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

