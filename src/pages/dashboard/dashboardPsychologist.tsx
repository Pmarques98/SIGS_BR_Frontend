import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { setAPIClient } from '../../services/apiBuilder';
import { Button } from '../../components/ui/Button';

export default function DashboardPsychologist() {
  const router = useRouter();
  const { cpf, name } = router.query;
  const cpf_psychologist = cpf;
  const nome_psychologist = name;

  const [availableConsultations, setAvailableConsultations] = useState<any[]>([]);
  const [acceptedConsultations, setAcceptedConsultations] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<{ isUpcoming: boolean; link_meets: string | null }>({
    isUpcoming: false,
    link_meets: null,
  });
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const acceptedPollingRef = useRef<NodeJS.Timeout | null>(null);
  const [linkId, setLinkId] = useState('');
  const [link, setLink] = useState('');
  const [children, setChildren] = useState<any[]>([]);
  const [notificationReports, setNotificationReports] = useState<{ [key: number]: string }>({});
  const [notifyingId, setNotifyingId] = useState<number | null>(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Ajuda ilustrativa
  const [showHelp2, setShowHelp2] = useState(false); // para exibir após login
  const [showHelp, setShowHelp] = useState(false);   // para exibir via botão

  async function fetchConsultationsAndUpcoming() {
    if (!cpf_psychologist) return;
    try {
      const api = setAPIClient();
      const response = await api.post('/dashboard/psicologo', { cpf_psychologist });

      if (response.data && response.data.error) {
        setResponseMessage(response.data.error);
        setAvailableConsultations([]);
        setUpcoming({ isUpcoming: false, link_meets: null });
      } else {
        setAvailableConsultations(
          Array.isArray(response.data.unassignedConsultations) ? response.data.unassignedConsultations : []
        );

        if (response.data.upcomingConsultation) {
          setUpcoming({
            isUpcoming: !!response.data.upcomingConsultation.isUpcoming,
            link_meets: response.data.upcomingConsultation.link_meets,
          });
        } else {
          setUpcoming({ isUpcoming: false, link_meets: null });
        }

        if (Array.isArray(response.data.children)) {
          setChildren(response.data.children);
        } else {
          setChildren([]);
        }

        setTimeout(() => {
          setUpcoming({ isUpcoming: false, link_meets: null });
        }, 20 * 60 * 1000); // 20 minutos
      }
    } catch (err: any) {
      setResponseMessage('Erro ao buscar consultas');
      setAvailableConsultations([]);
      setUpcoming({ isUpcoming: false, link_meets: null });
    }
    setLoading(false);
  }

  async function fetchAcceptedConsultations() {
    if (!cpf_psychologist) return;
    try {
      const api = setAPIClient();
      const response = await api.post('/consulta/aceitas', { cpf_psychologist });

      if (response.data && Array.isArray(response.data)) {
        setAcceptedConsultations(response.data);
      } else {
        setAcceptedConsultations([]);
      }
    } catch (err: any) {
      setAcceptedConsultations([]);
    }
  }

  async function handleAcceptConsultation(id: number) {
    if (!cpf_psychologist) return;
    try {
      const api = setAPIClient();
      await api.post('/consulta/aceitar', { id, cpf_psychologist });
      setResponseMessage('Consulta aceita com sucesso!');
      fetchConsultationsAndUpcoming();
    } catch (err) {
      setResponseMessage('Erro ao aceitar consulta');
    }
  }

  async function handleSendLink() {
    if (!linkId || !link) {
      setResponseMessage('Preencha todos os campos');
      return;
    }

    try {
      const api = setAPIClient();
      await api.post('/consulta/alterarMeets', {
        id: linkId,
        link_meets: link,
      });

      setResponseMessage('Link enviado com sucesso!');
      setLinkId('');
      setLink('');
    } catch (err) {
      setResponseMessage('Erro ao enviar o link');
      setLinkId('');
      setLink('');
    }
  }

  async function handleNotifyUser(child: any) {
    if (!notificationReports[child.id]) {
      setResponseMessage('Preencha o campo de notificação.');
      return;
    }
    setNotifyingId(child.id);
    try {
      const api = setAPIClient();
      await api.post('/notificacao', {
        report: notificationReports[child.id],
        cpf_psychologist: cpf_psychologist,
        name_child: child.name_child,
        cpf_child: child.cpf_child,
        cpf_user: child.cpf_user,
      });
      setResponseMessage('Notificação enviada com sucesso!');
      setNotificationReports((prev) => ({ ...prev, [child.id]: '' }));
    } catch (err) {
      setResponseMessage('Erro ao enviar notificação.');
    }
    setNotifyingId(null);
  }

  useEffect(() => {
    if (!cpf_psychologist) return;

    fetchConsultationsAndUpcoming();
    fetchAcceptedConsultations();

    pollingRef.current = setInterval(fetchConsultationsAndUpcoming, 10000);
    acceptedPollingRef.current = setInterval(fetchAcceptedConsultations, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (acceptedPollingRef.current) clearInterval(acceptedPollingRef.current);
    };
  }, [cpf_psychologist]);

  useEffect(() => {
    if (responseMessage) {
      const timer = setTimeout(() => setResponseMessage(null), 5000);
      return () => clearTimeout(timer);
    }
    // Mostra explicação só após login, se localStorage pedir
    if (localStorage.getItem('showDashboard2Help') === 'true') {
      setShowHelp2(true);
      localStorage.removeItem('showDashboard2Help');
    }
  }, [responseMessage]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', display: 'flex' }}>
      {/* Imagem explicativa do dashboard (após login ou botão de ajuda) */}
      {(showHelp2 || showHelp) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ position: 'relative', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px #0002', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 18, fontWeight: 700, fontSize: 28 }}>
              POAP: Como utilizar
            </h2>
            <img
              src="/dashboard-psychologist-explicado.png"
              alt="Explicação do dashboard do psicólogo"
              style={{ maxWidth: '90vw', maxHeight: '65vh', borderRadius: 8, marginBottom: 32, zoom: 1.25 }}
            />
            <button
              onClick={() => {
                setShowHelp(false);
                setShowHelp2(false);
              }}
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '12px 32px',
                fontWeight: 600,
                fontSize: 18,
                cursor: 'pointer',
                marginTop: 8,
                alignSelf: 'center'
              }}
            >
              Lido
            </button>
          </div>
        </div>
      )}

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
          onClick={() => router.push(`/recommendations/createRecommendations?cpf=${cpf_psychologist}`)}
        >
          Escrever recomendação
        </Button>
        <Button
          style={{ marginBottom: '1rem', width: '100%' }}
          onClick={() => router.push(`/recommendations/createPrivateRecommendations?cpf=${cpf_psychologist}`)}
        >
          Escrever recomendação particular
        </Button>
        {/* Botão de ajuda manual */}
        <Button
          style={{ width: '100%' }}
          onClick={() => setShowHelp(true)}
        >
          Ajuda
        </Button>
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <h3 style={{ margin: 0, color: '#1976d2' }}>Enviar link</h3>
          <input
            type="text"
            placeholder="Id"
            value={linkId}
            onChange={(e) => setLinkId(e.target.value)}
            style={{
              border: '1.5px solid #e3e3e3',
              borderRadius: 8,
              padding: '0.7rem 1rem',
              fontSize: '1rem',
              background: '#f7fafd',
              marginBottom: '0.5rem',
            }}
          />
          <input
            type="text"
            placeholder="Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            style={{
              border: '1.5px solid #e3e3e3',
              borderRadius: 8,
              padding: '0.7rem 1rem',
              fontSize: '1rem',
              background: '#f7fafd',
              marginBottom: '0.5rem',
            }}
          />
          <Button onClick={handleSendLink}>Enviar</Button>
        </div>
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
          Bem vindo ao dashboard do psicólogo: {nome_psychologist || '...'} ({cpf_psychologist || '...'})
        </h1>

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
            <strong>OBS: Entre mais cedo para criar a reunião e enviar o link</strong>
            <br />
            <a href={upcoming.link_meets} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
              Entrar na consulta
            </a>
          </div>
        )}

        {/* Listar consultas */}
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
          <h2 style={{ color: '#1976d2', marginBottom: '1rem' }}>Listar consultas</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>ID</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Descrição</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Data</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {availableConsultations.map((item) => (
                <tr key={item.id}>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.id}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.description}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.data_consultation}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>
                    <Button onClick={() => handleAcceptConsultation(item.id)}>Aceitar consulta</Button>
                  </td>
                </tr>
              ))}
              {availableConsultations.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 12 }}>Nenhuma consulta disponível.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Minhas Consultas */}
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
          <h2 style={{ color: '#1976d2', marginBottom: '1rem' }}>Minhas Consultas</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>ID</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Descrição</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Data</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>CPF Usuário</th>
                <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>CPF Criança</th>
              </tr>
            </thead>
            <tbody>
              {acceptedConsultations.map((item) => (
                <tr key={item.id}>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.id}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.description}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.data_consultation}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.cpf_user}</td>
                  <td style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem' }}>{item.cpf_paciente}</td>
                </tr>
              ))}
              {acceptedConsultations.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 12 }}>Nenhuma consulta aceita.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Crianças consultadas */}
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
          <h2 style={{ color: '#1976d2', marginBottom: '1rem' }}>Crianças consultadas</h2>
          {children.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>ID</th>
                  <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>CPF da Criança</th>
                  <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>CPF do Responsável</th>
                  <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Telefone do Responsável</th>
                  <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Nome da Criança</th>
                  <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Status</th>
                  <th style={{ border: '1px solid #e3e3e3', padding: '0.7rem 0.5rem', background: '#f7fafd', color: '#1976d2', fontWeight: 600 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {[...children]
                  .sort((a, b) => {
                    const order: { [key: string]: number } = { critico: 4, grave: 3, moderado: 2, leve: 1 };
                    return (order[b.status as string] || 0) - (order[a.status as string] || 0);
                  })
                  .map((child: any) => {
                    let bgColor = '#fff';
                    let color = '#000';
                    if (child.status === 'critico') {
                      bgColor = '#ffcccc';
                      color = '#b71c1c';
                    } else if (child.status === 'grave') {
                      bgColor = '#ffeaea';
                      color = '#d32f2f';
                    } else if (child.status === 'moderado') {
                      bgColor = '#f0f0f0';
                      color = '#616161';
                    } else if (child.status === 'leve') {
                    bgColor = '#e8f5e9';
                    color = '#388e3c';
                  }
                    return (
                      <tr key={child.id} style={{ backgroundColor: bgColor, color }}>
                        <td>{child.id}</td>
                        <td>{child.cpf_child}</td>
                        <td>{child.cpf_user}</td>
                        <td>{child.cellphone_user}</td>
                        <td>{child.name_child}</td>
                        <td style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{child.status}</td>
                        <td>
                          {(child.status === 'grave' || child.status === 'critico' || child.status === 'moderado' || child.status === 'leve') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="text"
                                placeholder="Mensagem da notificação"
                                value={notificationReports[child.id] || ''}
                                onChange={e =>
                                  setNotificationReports(prev => ({
                                    ...prev,
                                    [child.id]: e.target.value,
                                  }))
                                }
                                style={{ padding: '0.3rem', borderRadius: 4, border: '1px solid #ccc', minWidth: 180 }}
                              />
                              <button
                                onClick={() => handleNotifyUser(child)}
                                disabled={notifyingId === child.id}
                                style={{
                                  padding: '0.3rem 0.7rem',
                                  backgroundColor: '#1976d2',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                }}
                              >
                                {notifyingId === child.id ? 'Enviando...' : 'Notifique o usuário'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#888' }}>Nenhuma criança consultada encontrada.</p>
          )}
        </section>

        {responseMessage && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2000,
              minWidth: 260,
              maxWidth: 400,
              color: responseMessage.toLowerCase().includes('não') ? '#d32f2f' : '#388e3c',
              background: responseMessage.toLowerCase().includes('não') ? '#ffebee' : '#e8f5e9',
              border: responseMessage.toLowerCase().includes('não') ? '1.5px solid #d32f2f' : '1.5px solid #388e3c',
              borderRadius: 12,
              padding: '1.2rem 2rem',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '1.1rem',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
              transition: 'opacity 0.3s'
            }}
          >
              {responseMessage}
            </div>
          )}
      </main>
    </div>
  );
}