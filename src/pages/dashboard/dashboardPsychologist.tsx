import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { setAPIClient } from '../../services/apiBuilder';
import { Button } from '../../components/ui/Button';

export default function DashboardPsychologist() {
  const router = useRouter();
  const { cpf } = router.query;
  const cpf_psychologist = cpf;

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
  }, [responseMessage]);

  return (
    <div style={{ position: 'relative' }}>
      <h1>Bem vindo ao dashboard do psicólogo</h1>
      {cpf_psychologist && <p>Conta: {cpf_psychologist}</p>}

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
          <strong>OBS: Entre mais cedo para criar a reuniao e enviar o link</strong>
          <br />
          <a href={upcoming.link_meets} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
            Entrar na consulta
          </a>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h2>Listar consultas</h2>
        <span style={{ fontSize: '1.5rem', color: '#ccc' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ margin: 0 }}>Enviar link</h2>
          <input
            type="text"
            placeholder="Id"
            value={linkId}
            onChange={(e) => setLinkId(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '3rem',
              textAlign: 'center',
            }}
          />
          <input
            type="text"
            placeholder="Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', width: '19rem', textAlign: 'center' }}
          />
          <button
            onClick={handleSendLink}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Enviar
          </button>
        </div>
      </div>

      <ul>
        {availableConsultations.map((item, idx) => (
          <li key={idx}>
            <strong>ID:</strong> {item.id}
            <br />
            <strong>Descrição:</strong> {item.description}
            <br />
            <strong>Data:</strong> {item.data_consultation}
            <br />
            <button onClick={() => handleAcceptConsultation(item.id)}>Aceitar consulta</button>
            <hr />
          </li>
        ))}
      </ul>

      <h2>Minhas Consultas</h2>
      <ul>
        {acceptedConsultations.map((item, idx) => (
          <li key={idx}>
            <strong>ID:</strong> {item.id}
            <br />
            <strong>Descrição:</strong> {item.description}
            <br />
            <strong>Data da consulta:</strong> {item.data_consultation}
            <br />
            <strong>Cpf do usuário:</strong> {item.cpf_user}
            <br />
            <strong>Cpf da criança:</strong> {item.cpf_paciente}
            <br />
            <hr />
          </li>
        ))}
      </ul>

      <h2>Crianças consultadas</h2>
      {children.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }} border={1}>
          <thead>
            <tr>
              <th>ID</th>
              <th>CPF da Criança</th>
              <th>CPF do Responsável</th>
              <th>Telefone do Responsável</th>
              <th>Nome da Criança</th>
              <th>Status</th>
              <th>Ações</th>
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
        <p>Nenhuma criança consultada encontrada.</p>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
        <Button
          type="button"
          onClick={() => router.push(`/recommendations/createRecommendations?cpf=${cpf_psychologist}`)}
          style={{
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
            backgroundColor: '#4caf50',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '2rem 1.5rem',
          }}
        >
          Escrever recomendações
        </Button>
        <Button
          type="button"
          onClick={() => router.push(`/recommendations/createPrivateRecommendations?cpf=${cpf_psychologist}`)}
          style={{
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
            backgroundColor: '#1976d2',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '2rem 1.5rem',
          }}
        >
          Escrever Recomendações particulares
        </Button>
      </div>

      {responseMessage && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            padding: '1rem 2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            textAlign: 'center',
            color: responseMessage.toLowerCase().includes('erro') || responseMessage.toLowerCase().includes('error')
              ? 'red'
              : 'green',
          }}
        >
          {responseMessage}
        </div>
      )}
    </div>
  );
}