import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { setAPIClient } from '../../services/apiBuilder';
import { Button } from '../../components/ui/Button'; 

export default function DashboardPsychologist() {
  const router = useRouter();
  const { cpf } = router.query;
  const cpf_psychologist = cpf;

  const [availableConsultations, setAvailableConsultations] = useState<any[]>([]);
  const [acceptedConsultations, setAcceptedConsultations] = useState<any[]>([]); // Estado para "Minhas Consultas"
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

  async function fetchConsultationsAndUpcoming() {
  if (!cpf_psychologist) return;
  try {
    const api = setAPIClient();
    const response = await api.post('/dashboard/psicologo', { cpf_psychologist });

    console.log('Resposta da API:', response.data);

    if (response.data && response.data.error) {
      setResponseMessage(response.data.error);
      setTimeout(() => setResponseMessage(null), 5000); // Limpa a mensagem após 5 segundos
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

        setTimeout(() => {
          setUpcoming({ isUpcoming: false, link_meets: null });
        }, 20 * 60 * 1000); // 20 minutos
      } else {
        setUpcoming({ isUpcoming: false, link_meets: null });
      }
    }
  } catch (err: any) {
    setResponseMessage('Erro ao buscar consultas');
    setTimeout(() => setResponseMessage(null), 5000); // Limpa a mensagem após 5 segundos
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

    console.log('Consultas aceitas:', response.data);

    if (response.data && Array.isArray(response.data)) {
      setAcceptedConsultations(response.data);
    } else {
      setAcceptedConsultations([]);
    }
  } catch (err: any) {
    console.error('Erro ao buscar consultas aceitas:', err);
    setAcceptedConsultations([]);
  }
}

async function handleAcceptConsultation(id: number) {
  if (!cpf_psychologist) return;
  try {
    const api = setAPIClient();
    await api.post('/consulta/aceitar', { id, cpf_psychologist });
    setResponseMessage('Consulta aceita com sucesso!');
    setTimeout(() => setResponseMessage(null), 5000); // Limpa a mensagem após 5 segundos
    fetchConsultationsAndUpcoming();
  } catch (err) {
    setResponseMessage('Erro ao aceitar consulta');
    setTimeout(() => setResponseMessage(null), 5000); // Limpa a mensagem após 5 segundos
  }
  }

  async function handleSendLink() {
  if (!linkId || !link) {
    setResponseMessage('Preencha todos os campos');
    setTimeout(() => setResponseMessage(null), 5000); // Timeout de 5 segundos
    return;
  }

  try {
    const api = setAPIClient();
    const response = await api.post('/consulta/alterarMeets', {
      id: linkId,
      link_meets: link,
    });

      setResponseMessage('Link enviado com sucesso!');
      setTimeout(() => setResponseMessage(null), 5000); // Timeout de 5 segundos
      setLinkId(''); 
      setLink(''); // Limpa os campos após o envio

  } catch (err) {
    console.error('Erro na requisição:', err);
    setResponseMessage('Erro ao enviar o link');
    setLinkId(''); 
    setLink('');
  }

  setTimeout(() => setResponseMessage(null), 5000); // Timeout de 5 segundos
  }

  useEffect(() => {
    if (!cpf_psychologist) return;

    // Busca inicial
    fetchConsultationsAndUpcoming();
    fetchAcceptedConsultations();

    // Configura polling para consultas disponíveis
    pollingRef.current = setInterval(fetchConsultationsAndUpcoming, 10000); // A cada 10s

    // Configura polling para consultas aceitas
    acceptedPollingRef.current = setInterval(fetchAcceptedConsultations, 10000); // A cada 10s

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (acceptedPollingRef.current) clearInterval(acceptedPollingRef.current);
    };
  }, [cpf_psychologist]);

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
              width: '3rem', // Ajustado para caber 3 dígitos
              textAlign: 'center', // Centraliza o texto no campo
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

      <button onClick={fetchConsultationsAndUpcoming} disabled={loading || !cpf_psychologist}>
        {loading ? 'Buscando...' : 'Atualizar consultas'}
      </button>
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
            <strong>Data:</strong> {item.data_consultation}
            <br />
            <strong>Status:</strong> {item.status}
            <hr />
          </li>
        ))}
      </ul>

      <Button
        type="button"
        onClick={() => router.push(`/recommendations/createRecommendations?cpf=${cpf_psychologist}`)}
        style={{
          marginTop: '2rem',
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