import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { setAPIClient } from '../../services/apiBuilder';

export default function DashboardUser() {
  const router = useRouter();
  const { cpf } = router.query;

  const [description, setDescription] = useState('');
  const [cpfPaciente, setCpfPaciente] = useState('');
  const [dataConsultation, setDataConsultation] = useState('');
  const [myConsultations, setMyConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  // Notificação de consulta próxima
  const [upcoming, setUpcoming] = useState<{ isUpcoming: boolean, link_meets: string | null }>({ isUpcoming: false, link_meets: null });
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Função para converter o horário local do input para UTC ISO string
  function toUTCISOString(localDateStr: string) {
    if (!localDateStr) return '';
    const localDate = new Date(localDateStr);
    // Ajusta para UTC
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
        setUpcoming({ isUpcoming: false, link_meets: null });
      } else {
        setMyConsultations(Array.isArray(response.data.consultations) ? response.data.consultations : []);
        if (response.data.upcomingConsultation) {
          setUpcoming({
            isUpcoming: !!response.data.upcomingConsultation.isUpcoming,
            link_meets: response.data.upcomingConsultation.link_meets,
          });
        } else {
          setUpcoming({ isUpcoming: false, link_meets: null });
        }
      }
    } catch (err: any) {
      setResponseMessage('Erro ao buscar suas consultas');
      setMyConsultations([]);
      setUpcoming({ isUpcoming: false, link_meets: null });
    }
    setLoading(false);
  }

  // Polling para upcomingConsultation
  useEffect(() => {
    if (!cpf) return;
    fetchConsultationsAndUpcoming(); // busca inicial
    pollingRef.current = setInterval(fetchConsultationsAndUpcoming, 10000); // a cada 10s
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line
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

  async function handleListMyConsultations() {
    setLoading(true);
    setResponseMessage(null);
    await fetchConsultationsAndUpcoming();
    setLoading(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <h1>Bem vindo a pagina principal do usuario</h1>
      {cpf && <p>Conta: {cpf}</p>}

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
            Acessar Google Meets
          </a>
        </div>
      )}

      <h2>Minhas consultas</h2>
      <button onClick={handleListMyConsultations} disabled={loading || !cpf}>
        {loading ? 'Buscando...' : 'Listar minhas consultas'}
      </button>
      <ul>
        {(Array.isArray(myConsultations) ? myConsultations : []).map((item, idx) => (
          <li key={idx}>
            <strong>ID:</strong> {item.id}<br />
            <strong>Descrição:</strong> {item.description}<br />
            <strong>Data:</strong> {item.data_consultation}<br />
            <strong>Status:</strong> {item.status}<br />
            <hr />
          </li>
        ))}
      </ul>
      
      <h2>Criar nova consulta</h2>
      <form onSubmit={handleCreateConsultation}>
        <textarea
          placeholder="Descrição"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          placeholder="CPF do paciente"
          value={cpfPaciente}
          onChange={e => setCpfPaciente(e.target.value)}
        />
        <input
          type="datetime-local"
          value={dataConsultation}
          onChange={e => setDataConsultation(e.target.value)}
        />
        <button type="submit">Criar Consulta</button>
      </form>

      {responseMessage && (
        <div style={{ margin: '10px 0', color: responseMessage.toLowerCase().includes('erro') || responseMessage.toLowerCase().includes('error') ? 'red' : 'green' }}>
          {responseMessage}
        </div>
      )}
    </div>
  );
}