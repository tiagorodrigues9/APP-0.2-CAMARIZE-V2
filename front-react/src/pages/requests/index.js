import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

export default function MyRequests() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [tiposCamarao, setTiposCamarao] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const getToken = () => (typeof window !== 'undefined' ? (sessionStorage.getItem('token') || localStorage.getItem('token')) : null);

  const load = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [res, tipos] = await Promise.all([
        axios.get(`${apiUrl}/requests/mine`, { headers }),
        axios.get(`${apiUrl}/camaroes`, { headers }).catch(() => ({ data: [] }))
      ]);
      setItems(res.data || []);
      setTiposCamarao(tipos.data || []);
    } catch (e) {
      setError('Erro ao carregar suas solicitações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) load();
  }, [authLoading, isAuthenticated]);

  const filtered = items.filter(item => {
    if (!dateFilter) return true;
    const [y, m, d] = dateFilter.split('-').map(Number);
    const fd = new Date(y, m - 1, d);
    const di = new Date(item.createdAt);
    return di.getFullYear() === fd.getFullYear() && di.getMonth() === fd.getMonth() && di.getDate() === fd.getDate();
  });

  const statusChipStyle = (status) => ({
    padding: '4px 8px',
    borderRadius: 999,
    fontSize: '12px',
    background: status === 'aprovado' ? '#dcfce7' : status === 'recusado' ? '#fee2e2' : '#fef3c7',
    color: status === 'aprovado' ? '#166534' : status === 'recusado' ? '#991b1b' : '#92400e'
  });

  const actionLabel = (action) => ({
    editar_cativeiro: 'Editar cativeiro',
    editar_sensor: 'Editar sensor',
    cadastrar_cativeiro: 'Cadastrar cativeiro',
    excluir_cativeiro: 'Excluir cativeiro',
    cadastrar_sensor: 'Cadastrar sensor',
    excluir_sensor: 'Excluir sensor',
    editar_cativeiro_add_sensor: 'Adicionar sensor ao cativeiro',
    editar_cativeiro_remove_sensor: 'Remover sensor do cativeiro'
  })[action] || action;

  const getTipoCamaraoNome = (id) => {
    const t = tiposCamarao.find(x => String(x._id) === String(id));
    return t ? t.nome : id;
  };

  const renderPayloadPretty = (item) => {
    const { action, payload = {} } = item;
    if (action === 'editar_cativeiro') {
      const fields = [];
      if (typeof payload.nome !== 'undefined') fields.push({ label: 'Nome do cativeiro', value: payload.nome });
      if (typeof payload.id_tipo_camarao !== 'undefined') fields.push({ label: 'Tipo de camarão', value: getTipoCamaraoNome(payload.id_tipo_camarao) });
      if (typeof payload.temp_media_diaria !== 'undefined') fields.push({ label: 'Temperatura ideal (°C)', value: payload.temp_media_diaria });
      if (typeof payload.ph_medio_diario !== 'undefined') fields.push({ label: 'pH ideal', value: payload.ph_medio_diario });
      if (typeof payload.amonia_media_diaria !== 'undefined') fields.push({ label: 'Amônia ideal (mg/L)', value: payload.amonia_media_diaria });
      if (fields.length === 0) return null;
      return (
        <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
          {fields.map((f, i) => (
            <li key={i}><strong>{f.label}:</strong> {String(f.value)}</li>
          ))}
        </ul>
      );
    }

    // Fallback genérico: lista chaves legíveis e esconde ids técnicos
    const hiddenKeys = new Set(['_id', 'id', 'cativeiroId', 'sensorId', 'fazendaId', 'fazenda']);
    const entries = Object.entries(payload).filter(([k]) => !hiddenKeys.has(k));
    if (entries.length === 0) return null;
    return (
      <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
        {entries.map(([k, v]) => (
          <li key={k}><strong>{k.replaceAll('_', ' ')}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</li>
        ))}
      </ul>
    );
  };

  if (authLoading || loading) return <div style={{ padding: 20 }}>Carregando...</div>;
  if (!isAuthenticated) return <div style={{ padding: 20, color: 'red' }}>Sessão expirada. Faça login novamente.</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.back();
              }
            }}
            style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}
          >
            Voltar
          </button>
          <h2 style={{ margin: 0 }}>Minhas Solicitações</h2>
        </div>
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

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, padding: 12, background: '#f9fafb', borderRadius: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
          onClick={() => setDateFilter('')}
          style={{ padding: '6px 12px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '14px' }}
        >
          Limpar Filtros
        </button>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {filtered.length} de {items.length} solicitações
        </div>
      </div>

      {filtered.length === 0 && items.length > 0 && (
        <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>Nenhuma solicitação encontrada com os filtros aplicados.</div>
      )}
      {filtered.length === 0 && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>Você ainda não enviou solicitações.</div>
      )}

      {filtered.map(item => (
        <div key={item._id} style={{ border: '1px solid #e5e7eb', padding: 14, marginBottom: 12, borderRadius: 10, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/images/history.svg" alt="Histórico" width="18" height="18" />
              <div style={{ fontWeight: 600 }}>{actionLabel(item.action)}</div>
            </div>
            <span style={statusChipStyle(item.status)}>
              {item.status === 'aprovado' ? 'Aprovado' : item.status === 'recusado' ? 'Recusado' : 'Pendente'}
            </span>
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: '#6b7280' }}>
            {new Date(item.createdAt).toLocaleString('pt-BR')}
          </div>
          {item.payload && Object.keys(item.payload).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Alterações solicitadas:</div>
              {renderPayloadPretty(item)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


