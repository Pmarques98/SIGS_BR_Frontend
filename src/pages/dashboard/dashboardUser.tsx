import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { setAPIClient } from '../../services/apiBuilder';
import { Button } from '../../components/ui/Button';

export default function DashboardUser() {
  const router = useRouter();
  const { cpf, nome } = router.query;

  const [description, setDescription] = useState('');
  const [cpfPaciente, setCpfPaciente] = useState('');
  const [dataConsultation, setDataConsultation] = useState('');
  const [myConsultations, setMyConsultations] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const [upcoming, setUpcoming] = useState<{ isUpcoming: boolean, link_meets: string | null }>({ isUpcoming: false, link_meets: null });
  const [notificationsAvailable, setNotificationsAvailable] = useState<any[]>([]);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  function toUTCISOString(localDateStr: string) {
    if (!localDateStr) return '';
    const localDate = new Date(localDateStr);
    const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
    return utcDate.toISOString();
  }

  async function fetchConsultationsAndUpcoming() {
    if (!cpf) return;
    try {
      const api = setAPIClient();
      const response = await api.post('/dashboard/usuario', {
        cpf_user: cpf,
      });
      if (response.data && response.data.error) {
        setResponseMessage(response.data.error);
        setMyConsultations([]);
        setChildren([]);
        setUpcoming({ isUpcoming: false, link_meets: null });
        setNotificationsAvailable([]);
      } else {
        setMyConsultations(Array.isArray(response.data.consultations) ? response.data.consultations : []);
        setChildren(Array.isArray(response.data.children) ? response.data.children : []);
        setNotificationsAvailable(Array.isArray(response.data.notificationsAvailable) ? response.data.notificationsAvailable : []);
        if (response.data.upcomingConsultation) {
          setUpcoming({
            isUpcoming: !!response.data.upcomingConsultation.isUpcoming,
            link_meets: response.data.upcomingConsultation.link_meets,
          });
          setTimeout(() => {
            setUpcoming({ isUpcoming: false, link_meets: null });
          }, 20 * 60 * 1000);
        } else {
          setUpcoming({ isUpcoming: false, link_meets: null });
        }
      }
    } catch (err: any) {
      setResponseMessage('Erro ao buscar suas consultas');
      setMyConsultations([]);
      setChildren([]);
      setUpcoming({ isUpcoming: false, link_meets: null });
      setNotificationsAvailable([]);
    }
    setLoading(false);
  }

  async function handleCloseNotification(id: number) {
    try {
      const api = setAPIClient();
      await api.post('/notificacao/visualizada', { id });
      setNotificationsAvailable((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setResponseMessage('Erro ao fechar notificação');
    }
  }

  useEffect(() => {
    if (!cpf) return;
    fetchConsultationsAndUpcoming();
    pollingRef.current = setInterval(fetchConsultationsAndUpcoming, 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [cpf]);

  async function handleCreateConsultation(e: React.FormEvent) {
    e.preventDefault();
    setResponseMessage(null);
    try {
      const api = setAPIClient();
      const response = await api.post('/consulta', {
        description,
        cpf_user: cpf,
        cpf_paciente: cpfPaciente,
        data_consultation: toUTCISOString(dataConsultation),
      });
      if (response.data && response.data.error) {
        setResponseMessage(response.data.error);
      } else {
        setResponseMessage('Consulta criada com sucesso!');
        setDescription('');
        setCpfPaciente('');
        setDataConsultation('');
        fetchConsultationsAndUpcoming();
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setResponseMessage(err.response.data.error);
      } else {
        setResponseMessage('Erro ao criar consulta');
      }
    }
  }

  useEffect(() => {
    if (responseMessage) {
      const timer = setTimeout(() => setResponseMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [responseMessage]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', display: 'flex' }}>
      {/* Drawer lateral */}
      <nav
        style={{
          position: 'fixed',
          left: drawerOpen ? 0 : -260,
          top: 0,
          width: 260,
          height: '100vh',
          background: '#fff',
          boxShadow: '2px 0 16px rgba(25, 118, 210, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '2rem 1.2rem 1.2rem 1.2rem',
          zIndex: 1200,
          transition: 'left 0.3s',
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            fontSize: '2rem',
            color: '#1976d2',
            alignSelf: 'flex-end',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
          onClick={() => setDrawerOpen(false)}
        >
          ×
        </button>
        <Button
          style={{ marginBottom: '1rem', width: '100%' }}
          onClick={() => router.push(`/recommendations/recommendations?cpf=${cpf}`)}
        >
          Recomendações
        </Button>
      </nav>

      {/* Botão para abrir drawer */}
      <button
        style={{
          position: 'fixed',
          left: 16,
          top: 16,
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: 44,
          height: 44,
          fontSize: '2rem',
          cursor: 'pointer',
          zIndex: 1300,
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
        }}
        onClick={() => setDrawerOpen(true)}
      >
        ☰
      </button>

      {/* Conteúdo central */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2.5rem',
        marginLeft: 0,
        padding: '3rem 1rem 1rem 1rem',
        width: '100%',
      }}>
        <h1 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 0 }}>
          Bem vindo ao dashboard do usuário: {nome || '...'} ({cpf || '...'})
        </h1>

        {/* Notificações */}
        {notificationsAvailable.length > 0 && notificationsAvailable.map((notification) => (
          <div
            key={notification.id}
            style={{
              position: 'fixed',
              top: 80,
              right: 20,
              background: '#fff',
              border: '2px solid #1976d2',
              borderRadius: 8,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1100,
              minWidth: 250,
              marginBottom: 10,
            }}
          >
            <strong>Nova notificação</strong>
            <br />
            <strong>Nome da criança:</strong> {notification.name_child}
            <br />
            <strong>CPF da criança:</strong> {notification.cpf_child}
            <br />
            <strong>Data e hora do envio:</strong> {
              notification.data
                ? new Date(notification.data).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })
                : ''
            }
            <br />
            <strong>Mensagem:</strong> {notification.report}
            <br />
            <a
              href="#"
              style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', float: 'right', marginTop: 8 }}
              onClick={e => {
                e.preventDefault();
                handleCloseNotification(notification.id);
              }}
            >
              Fechar
            </a>
          </div>
        ))}

        {/* Notificação de consulta próxima */}
        {upcoming.isUpcoming && upcoming.link_meets && (
          <div
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              background: '#fff',
              border: '2px solid #4caf50',
              borderRadius: 8,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: 250,
            }}
          >
            <strong>Você tem uma consulta em breve!</strong>
            <br />
            <a href={upcoming.link_meets} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
              Entrar na consulta
            </a>
          </div>
        )}

        {/* Minhas consultas */}
        <section style={{
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          padding: '2rem 2rem 1.5rem 2rem',
          minWidth: 340,
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
        }}>
          <h2 style={{ color: '#1976d2', marginBottom: '1rem' }}>Minhas consultas</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>ID</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Descrição</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Data</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(myConsultations) ? myConsultations : []).map((item, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.id}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.description}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.data_consultation}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.cpf_psychologist ? 'Aceita pelo psicólogo' : 'Em aguardo'}</td>
                </tr>
              ))}
              {myConsultations.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 12 }}>Nenhuma consulta encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Criar nova consulta */}
        <section style={{
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          padding: '2rem 2rem 1.5rem 2rem',
          minWidth: 340,
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
        }}>
          <h2 style={{ color: '#1976d2', marginBottom: '1rem' }}>Criar nova consulta</h2>
          <form onSubmit={handleCreateConsultation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea
              placeholder="Descrição"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ borderRadius: 8, border: '1.5px solid #e3e3e3', padding: '0.7rem 1rem', fontSize: '1rem', background: '#f7fafd' }}
            />
            <input
              type="text"
              placeholder="CPF do paciente"
              value={cpfPaciente}
              onChange={e => setCpfPaciente(e.target.value.replace(/\D/g, '').slice(0, 11))}
              maxLength={11}
              pattern="\d{11}"
              inputMode="numeric"
              style={{ borderRadius: 8, border: '1.5px solid #e3e3e3', padding: '0.7rem 1rem', fontSize: '1rem', background: '#f7fafd' }}
            />
            <input
              type="datetime-local"
              value={dataConsultation}
              onChange={e => setDataConsultation(e.target.value)}
              style={{ borderRadius: 8, border: '1.5px solid #e3e3e3', padding: '0.7rem 1rem', fontSize: '1rem', background: '#f7fafd' }}
            />
            <Button type="submit" style={{ width: '100%', marginTop: 8 }}>
              Criar Consulta
            </Button>
          </form>
        </section>

        {/* Crianças cadastradas */}
        <section style={{
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          padding: '2rem 2rem 1.5rem 2rem',
          minWidth: 340,
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
        }}>
          <h2 style={{ color: '#1976d2', marginBottom: '1rem' }}>Crianças cadastradas</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>ID</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>CPF da Criança</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>CPF do Responsável</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Telefone do Responsável</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Nome da Criança</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Gravidade</th>
              </tr>
            </thead>
            <tbody>
              {children.map((child, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{child.id}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{child.cpf_crianca}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{child.cpf_responsavel}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{child.telefone_responsavel}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{child.nome_crianca}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{child.status}</td>
                </tr>
              ))}
              {children.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 12 }}>Nenhuma criança cadastrada encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {responseMessage && (
          <div style={{ margin: '10px 0', color: responseMessage.toLowerCase().includes('erro') || responseMessage.toLowerCase().includes('error') ? 'red' : 'green' }}>
            {responseMessage}
          </div>
        )}
      </main>
    </div>
  );
}