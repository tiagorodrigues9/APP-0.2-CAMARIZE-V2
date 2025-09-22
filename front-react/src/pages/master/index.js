import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

export default function MasterPanel() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [items, setItems] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [fazendas, setFazendas] = useState([]);
  const [cativeiros, setCativeiros] = useState([]);
  const [tiposCamarao, setTiposCamarao] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesterFilter, setRequesterFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [tab, setTab] = useState('requests'); // requests | solicitacoes | usuarios | cativeiros
  const [expandedFazenda, setExpandedFazenda] = useState({}); // id -> bool
  const [expandedCativeiro, setExpandedCativeiro] = useState({}); // id -> bool
  const [cativeirosByFazenda, setCativeirosByFazenda] = useState({}); // fazendaId -> [cativeiros]
  const [loadingFazenda, setLoadingFazenda] = useState({}); // fazendaId -> bool

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const getToken = () => (typeof window !== 'undefined' ? (sessionStorage.getItem('token') || localStorage.getItem('token')) : null);

  const load = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [reqs, us, fzs, cats, tipos] = await Promise.all([
        axios.get(`${apiUrl}/requests`, { headers }), // Requests pendentes para aprovar/recusar
        axios.get(`${apiUrl}/users`, { headers }),
        axios.get(`${apiUrl}/fazendas`, { headers }),
        axios.get(`${apiUrl}/cativeiros`, { headers }),
        axios.get(`${apiUrl}/camaroes`, { headers }),
      ]);
      setItems(reqs.data);
      setUsers(us.data);
      setFazendas(fzs.data);
      setCativeiros(cats.data);
      setTiposCamarao(tipos.data);
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
      const response = await axios.get(`${apiUrl}/requests/all`, { headers });
      console.log('Requests carregados do backend:', response.data);
      return response.data;
    } catch (e) {
      console.error('Erro ao carregar todos os requests:', e);
      return [];
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      load();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (tab === 'requests' && isAuthenticated) {
      loadAllRequests().then(setAllRequests);
    }
  }, [tab, isAuthenticated]);

  // Aplicar filtros quando allRequests ou filtros mudarem
  useEffect(() => {
    let filtered = [...allRequests];

    // Filtro por solicitante
    if (requesterFilter) {
      filtered = filtered.filter(item => 
        item.requesterUser?.nome?.toLowerCase().includes(requesterFilter.toLowerCase()) ||
        item.requesterUser?.email?.toLowerCase().includes(requesterFilter.toLowerCase())
      );
    }

    // Filtro por data
    if (dateFilter) {
      // Criar data local para evitar problemas de fuso horário
      const [year, month, day] = dateFilter.split('-').map(Number);
      const filterDate = new Date(year, month - 1, day); // month - 1 porque JS usa 0-11
      const filterYear = filterDate.getFullYear();
      const filterMonth = filterDate.getMonth();
      const filterDay = filterDate.getDate();
      
      console.log('Filtrando por data:', { 
        filterDate, 
        filterYear, 
        filterMonth, 
        filterDay,
        filterDateString: filterDate.toISOString().split('T')[0]
      });
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        const itemYear = itemDate.getFullYear();
        const itemMonth = itemDate.getMonth();
        const itemDay = itemDate.getDate();
        
        const matches = itemYear === filterYear && itemMonth === filterMonth && itemDay === filterDay;
        
        console.log('Verificando request:', {
          createdAt: item.createdAt,
          itemDate: itemDate.toISOString(),
          itemYear,
          itemMonth,
          itemDay,
          filterYear,
          filterMonth,
          filterDay,
          matches,
          action: item.action
        });
        
        return matches;
      });
    }

    setFilteredRequests(filtered);
  }, [allRequests, requesterFilter, dateFilter]);

  const act = async (id, op) => {
    const token = getToken();
    const response = await axios.post(`${apiUrl}/requests/${id}/${op}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Request atualizado:', response.data);
    await load();
    // Recarregar requests completos se estivermos na aba requests
    if (tab === 'requests') {
      const updatedRequests = await loadAllRequests();
      console.log('Requests recarregados:', updatedRequests);
      setAllRequests(updatedRequests);
    }
  };

  const clearFilters = () => {
    setRequesterFilter('');
    setDateFilter('');
  };

  const formatRequestDetails = (action, payload) => {
    if (action === 'cadastrar_cativeiro') {
      const fazenda = fazendas.find(f => f._id === payload.fazendaId);
      const tipoCamarao = tiposCamarao.find(t => t._id === payload.id_tipo_camarao);
      
      return (
        <div style={{ 
          background: '#f8fafc', 
          padding: 12, 
          borderRadius: 6, 
          marginTop: 8,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <strong>Nome:</strong> {payload.nome || 'N/A'}
            </div>
            <div>
              <strong>Fazenda:</strong> {fazenda ? `${fazenda.nome} - ${fazenda.codigo}` : payload.fazendaId || 'N/A'}
            </div>
            <div>
              <strong>Tipo de Camarão:</strong> {tipoCamarao ? tipoCamarao.nome : payload.id_tipo_camarao || 'N/A'}
            </div>
            <div>
              <strong>Data de Instalação:</strong> {payload.data_instalacao ? new Date(payload.data_instalacao).toLocaleDateString('pt-BR') : 'N/A'}
            </div>
            <div>
              <strong>Temp Ideal:</strong> {payload.temp_media_diaria ? `${payload.temp_media_diaria}°C` : 'N/A'}
            </div>
            <div>
              <strong>pH Ideal:</strong> {payload.ph_medio_diario || 'N/A'}
            </div>
            <div>
              <strong>Amônia Ideal:</strong> {payload.amonia_media_diaria ? `${payload.amonia_media_diaria} mg/L` : 'N/A'}
            </div>
          </div>
        </div>
      );
    } else if (action === 'editar_cativeiro') {
      const tipoCamarao = payload.id_tipo_camarao ? (tiposCamarao.find(t => t._id === payload.id_tipo_camarao) || null) : null;
      return (
        <div style={{ 
          background: '#f8fafc', 
          padding: 12, 
          borderRadius: 6, 
          marginTop: 8,
          border: '1px solid #e2e8f0'
        }}>
          <div><strong>Cativeiro ID:</strong> {payload.cativeiroId || 'N/A'}</div>
          {typeof payload.nome !== 'undefined' && (
            <div><strong>Novo Nome:</strong> {payload.nome || 'N/A'}</div>
          )}
          {typeof payload.id_tipo_camarao !== 'undefined' && (
            <div><strong>Novo Tipo de Camarão:</strong> {tipoCamarao ? tipoCamarao.nome : payload.id_tipo_camarao || 'N/A'}</div>
          )}
        </div>
      );
    } else if (action === 'editar_sensor') {
      return (
        <div style={{ 
          background: '#f8fafc', 
          padding: 12, 
          borderRadius: 6, 
          marginTop: 8,
          border: '1px solid #e2e8f0'
        }}>
          <div><strong>Sensor ID:</strong> {payload.id || 'N/A'}</div>
          <div><strong>Novo Apelido:</strong> {payload.apelido || 'N/A'}</div>
        </div>
      );
    } else {
      // Fallback para outras ações
      return (
        <pre style={{ 
          background: '#f9fafb', 
          padding: 8, 
          borderRadius: 4, 
          fontSize: '12px',
          marginTop: 4,
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      );
    }
  };

  const changeRole = async (id, role) => {
    const token = getToken();
    await axios.patch(`${apiUrl}/users/${id}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

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

  const ensureCativeirosForFazenda = async (fzId) => {
    // No-op: usamos os cativeiros já carregados em memória
    return;
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

  const deleteCativeiro = async (id) => {
    const token = getToken();
    await axios.delete(`${apiUrl}/cativeiros/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  const createCativeiro = async (fazendaId, nome) => {
    const token = getToken();
    await axios.post(`${apiUrl}/cativeiros`, { fazendaId, nome }, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  const localRole = typeof window !== 'undefined' ? (JSON.parse(sessionStorage.getItem('usuarioCamarize') || localStorage.getItem('usuarioCamarize') || '{}')?.role) : undefined;
  const effectiveRole = user?.role || localRole;
  if (authLoading || loading) return <div style={{ padding: 20 }}>Carregando...</div>;
  if (!isAuthenticated) return <div style={{ padding: 20, color: 'red' }}>Sessão expirada. Faça login novamente.</div>;
  if (!effectiveRole) return <div style={{ padding: 20 }}>Carregando permissões...</div>;
  if (effectiveRole !== 'master') return <div style={{ padding: 20, color: 'red' }}>Acesso restrito ao Master.</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Painel Master</h2>
        <button
          onClick={() => {
            try {
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
        <button onClick={() => setTab('usuarios')} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: tab==='usuarios'?'#eef':'#fff' }}>Usuários</button>
        <button onClick={() => setTab('cativeiros')} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: tab==='cativeiros'?'#eef':'#fff' }}>Cativeiros</button>
      </div>

      {tab === 'requests' && (
        <section>
          <h3>Histórico de Requests dos Admins</h3>
          
          {/* Filtros */}
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            marginBottom: 16, 
            padding: 12, 
            background: '#f9fafb', 
            borderRadius: 8,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Solicitante:</label>
              <input
                type="text"
                placeholder="Nome ou email..."
                value={requesterFilter}
                onChange={(e) => setRequesterFilter(e.target.value)}
                style={{ 
                  padding: '6px 10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 6, 
                  fontSize: '14px',
                  minWidth: '200px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Data:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ 
                  padding: '6px 10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 6, 
                  fontSize: '14px'
                }}
              />
            </div>
            
            <button
              onClick={() => {
                const today = new Date();
                const todayString = today.toISOString().split('T')[0];
                console.log('Data de hoje:', { today, todayString, day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() });
                setDateFilter(todayString);
              }}
              style={{
                padding: '6px 12px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Hoje
            </button>
            
            <button
              onClick={clearFilters}
              style={{
                padding: '6px 12px',
                background: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Limpar Filtros
            </button>
            
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {filteredRequests.length} de {allRequests.length} requests
            </div>
          </div>

          {filteredRequests.length === 0 && allRequests.length > 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>
              Nenhum request encontrado com os filtros aplicados.
            </div>
          )}
          
          {filteredRequests.length === 0 && allRequests.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>
              Nenhum request encontrado.
            </div>
          )}
          
          {filteredRequests.map(item => (
              <div key={item._id} style={{ 
                border: '1px solid #eee', 
                padding: 12, 
                marginBottom: 10,
                borderRadius: 6,
                background: item.status === 'approved' ? '#f0f9ff' : item.status === 'rejected' ? '#fef2f2' : '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <strong>Solicitante:</strong> {item.requesterUser?.nome || 'N/A'} ({item.requesterUser?.email || 'N/A'})
                  </div>
                  <div style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    fontSize: '12px',
                    background: item.status === 'aprovado' ? '#dcfce7' : item.status === 'recusado' ? '#fee2e2' : '#fef3c7',
                    color: item.status === 'aprovado' ? '#166534' : item.status === 'recusado' ? '#991b1b' : '#92400e'
                  }}>
                    {item.status === 'aprovado' ? '✅ Aprovado' : 
                     item.status === 'recusado' ? '❌ Recusado' : 
                     '⏳ Pendente'}
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
                    {formatRequestDetails(item.action, item.payload)}
                  </div>
                )}
                {item.status === 'pendente' && (
                  <div style={{ marginTop: 8 }}>
                    <button 
                      onClick={() => act(item._id, 'approve')}
                      style={{ 
                        background: '#10b981', 
                        color: '#fff', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: 4, 
                        cursor: 'pointer',
                        marginRight: 8
                      }}
                    >
                      Aprovar
                    </button>
                    <button 
                      onClick={() => act(item._id, 'reject')}
                      style={{ 
                        background: '#ef4444', 
                        color: '#fff', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: 4, 
                        cursor: 'pointer'
                      }}
                    >
                      Recusar
                    </button>
                  </div>
                )}
              </div>
            ))}
        </section>
      )}

      {tab === 'solicitacoes' && (
        <section>
          <h3>Solicitações pesadas (Admins)</h3>
          {items.length === 0 && <div>Nenhuma solicitação pendente.</div>}
          {items.map(item => (
            <div key={item._id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 10, borderRadius: 6 }}>
              <div style={{ marginBottom: 8 }}>
                <div><b>Ação:</b> {item.action}</div>
                <div><b>Tipo:</b> {item.type}</div>
                <div><b>Data:</b> {new Date(item.createdAt).toLocaleString('pt-BR')}</div>
              </div>
              {item.payload && Object.keys(item.payload).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <strong>Detalhes:</strong>
                  {formatRequestDetails(item.action, item.payload)}
                </div>
              )}
              <div>
                <button 
                  onClick={() => act(item._id, 'approve')}
                  style={{ 
                    background: '#10b981', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '6px 12px', 
                    borderRadius: 4, 
                    cursor: 'pointer',
                    marginRight: 8
                  }}
                >
                  Aprovar
                </button>
                <button 
                  onClick={() => act(item._id, 'reject')}
                  style={{ 
                    background: '#ef4444', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '6px 12px', 
                    borderRadius: 4, 
                    cursor: 'pointer'
                  }}
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === 'usuarios' && (
        <section>
          <h3>Usuários</h3>
          {users.map(u => (
            <div key={u.id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 10 }}>
              <div><b>{u.nome}</b> — {u.email} — Role atual: {u.role}</div>
              <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                <option value="membro">membro</option>
                <option value="admin">admin</option>
                <option value="master">master</option>
              </select>
            </div>
          ))}
        </section>
      )}

      {tab === 'cativeiros' && (
        <section>
          <h3>Fazendas e Cativeiros</h3>
          {/* Criar cativeiro rápido */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0' }}>
            <select id="sel-fazenda-quick" style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}>
              {fazendas.map(f => (
                <option key={f._id} value={f._id}>{getFazendaName(f._id)}</option>
              ))}
            </select>
            <input id="nome-cativeiro-quick" placeholder="Nome do novo cativeiro" style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            <button onClick={() => createCativeiro(
              document.getElementById('sel-fazenda-quick').value,
              document.getElementById('nome-cativeiro-quick').value
            )} style={{ border: '1px solid #eee', background: '#fff', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>Criar cativeiro</button>
          </div>
          {(() => {
            const grouped = groupedByFazenda();
            const hasAny = Object.values(grouped).some(arr => Array.isArray(arr) && arr.length > 0);
            if (!hasAny && Array.isArray(cativeiros) && cativeiros.length > 0) {
              // Fallback: renderizar lista simples como em /home
              return (
                <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 10 }}>
                  {cativeiros.map(c => (
                    <div key={c._id} style={{ border: '1px solid #f3f4f6', borderRadius: 6, padding: 10, marginBottom: 8 }}>
                      <div style={{ fontWeight: 600 }}>{c.nome || c._id}</div>
                      <div style={{ color: '#6b7280', fontSize: 13 }}>{c.id_tipo_camarao?.nome || c.id_tipo_camarao || '—'}</div>
                    </div>
                  ))}
                </div>
              );
            }
            return Object.entries(grouped).map(([fzId, cats]) => (
            <div key={fzId} style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 10 }}>
              <div
                onClick={() => {
                  const willExpand = !expandedFazenda[fzId];
                  setExpandedFazenda(prev => ({ ...prev, [fzId]: willExpand }));
                  if (willExpand) ensureCativeirosForFazenda(fzId);
                }}
                style={{ padding: 10, cursor: 'pointer', background: '#f9fafb', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>{getFazendaName(fzId)}</span>
                <span>{expandedFazenda[fzId] ? '▲' : '▼'}</span>
              </div>
              {expandedFazenda[fzId] && (
                <div style={{ padding: 10 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input placeholder="Nome do novo cativeiro" id={`novo-c-${fzId}`} style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
                    <button onClick={() => createCativeiro(fzId, document.getElementById(`novo-c-${fzId}`).value)} style={{ border: '1px solid #eee', background: '#fff', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>Criar</button>
                  </div>
                  {(((Array.isArray(cativeirosByFazenda[fzId]) && cativeirosByFazenda[fzId].length > 0) ? cativeirosByFazenda[fzId] : cats) || []).map(c => (
                    <div key={c._id} style={{ border: '1px solid #eee', borderRadius: 6, marginBottom: 8 }}>
                      <div
                        onClick={() => setExpandedCativeiro(prev => ({ ...prev, [c._id]: !prev[c._id] }))}
                        style={{ padding: 8, cursor: 'pointer', background: '#fff', display: 'flex', justifyContent: 'space-between' }}
                      >
                        <span>{c.nome || c._id}</span>
                        <span>{expandedCativeiro[c._id] ? '▲' : '▼'}</span>
                      </div>
                      {expandedCativeiro[c._id] && (
                        <div style={{ padding: 10 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                            <label style={{ minWidth: 80 }}>Nome:</label>
                            <input defaultValue={c.nome} id={`nome-${c._id}`} style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
                            <button onClick={() => updateCativeiroNome(c._id, document.getElementById(`nome-${c._id}`).value)} style={{ border: '1px solid #eee', background: '#fff', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>Salvar</button>
                            <button onClick={() => deleteCativeiro(c._id)} style={{ border: '1px solid #fca5a5', background: '#fee2e2', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>Excluir</button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div><b>Tipo de camarão:</b> {c.id_tipo_camarao?.nome || c.id_tipo_camarao || '—'}</div>
                            <div><b>Data instalação:</b> {c.data_instalacao ? new Date(c.data_instalacao).toLocaleDateString('pt-BR') : '—'}</div>
                            <div><b>Temp ideal:</b> {c.condicoes_ideais?.temp_ideal || c.temp_media_diaria || '—'}</div>
                            <div><b>pH ideal:</b> {c.condicoes_ideais?.ph_ideal || c.ph_medio_diario || '—'}</div>
                            <div><b>Amônia ideal:</b> {c.condicoes_ideais?.amonia_ideal || c.amonia_media_diaria || '—'}</div>
                          </div>
                          {Array.isArray(c.sensores) && c.sensores.length > 0 && (
                            <div style={{ marginTop: 10 }}>
                              <b>Sensores:</b>
                              <ul>
                                {c.sensores.map(s => (
                                  <li key={s._id || s}>{s.apelido || s.id_tipo_sensor || s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {loadingFazenda[fzId] && <div style={{ fontSize: 12, color: '#666' }}>Carregando cativeiros...</div>}
                </div>
              )}
            </div>
            ));
          })()}
        </section>
      )}
    </div>
  );
}

