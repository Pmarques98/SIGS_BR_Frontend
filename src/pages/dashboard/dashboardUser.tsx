import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { setAPIClient } from '../../services/apiBuilder';
import { Button } from '../../components/ui/Button'; 


export default function DashboardUser() {
  const router = useRouter();
  const { cpf } = router.query;

  const [description, setDescription] = useState('');
  const [cpfPaciente, setCpfPaciente] = useState('');
  const [dataConsultation, setDataConsultation] = useState('');
  const [myConsultations, setMyConsultations] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]); // Estado para armazenar a lista de crianças
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const [upcoming, setUpcoming] = useState<{ isUpcoming: boolean, link_meets: string | null }>({ isUpcoming: false, link_meets: null });
  const [notificationsAvailable, setNotificationsAvailable] = useState<any[]>([]);

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

  // Função para fechar notificação (marcar como visualizada)
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
    fetchConsultationsAndUpcoming(); // Busca inicial
    pollingRef.current = setInterval(fetchConsultationsAndUpcoming, 10000); // A cada 10s
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

      <h2>Minhas consultas</h2>
      <ul>
        {(Array.isArray(myConsultations) ? myConsultations : []).map((item, idx) => (
          <li key={idx}>
            <strong>ID:</strong> {item.id}<br />
            <strong>Descrição:</strong> {item.description}<br />
            <strong>Data:</strong> {item.data_consultation}<br />
            <strong>Status:</strong> {item.cpf_psychologist ? 'Aceita pelo psicólogo' : 'Em aguardo'}<br />            <hr />
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
          type="text"
          placeholder="CPF do paciente"
          value={cpfPaciente}
          onChange={e => setCpfPaciente(e.target.value.replace(/\D/g, '').slice(0, 11))}
          maxLength={11}
          pattern="\d{11}"
          inputMode="numeric"
        />
        <input
          type="datetime-local"
          value={dataConsultation}
          onChange={e => setDataConsultation(e.target.value)}
        />
        <button type="submit">Criar Consulta</button>
      </form>

      <h2>Crianças cadastradas</h2>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>CPF da Criança</th>
            <th>CPF do Responsável</th>
            <th>Telefone do Responsável</th>
            <th>Nome da Criança</th>
            <th>Gravidade</th>
          </tr>
        </thead>
        <tbody>
          {children.map((child, idx) => (
            <tr key={idx}>
              <td>{child.id}</td>
              <td>{child.cpf_crianca}</td>
              <td>{child.cpf_responsavel}</td>
              <td>{child.telefone_responsavel}</td>
              <td>{child.nome_crianca}</td>
              <td>{child.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botão para acessar a página de relatórios aceitos */}
      <Button
        type="button"
        onClick={() => router.push(`/recommendations/recommendations?cpf=${cpf}`)}
        style={{
          marginTop: '2rem', /* Ajuste conforme necessário */
          width: '100%',
          maxWidth: '400px', /* Certifique-se de que a largura é 100% para o alinhamento correto */
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
        Recomendações
      </Button>

      {responseMessage && (
        <div style={{ margin: '10px 0', color: responseMessage.toLowerCase().includes('erro') || responseMessage.toLowerCase().includes('error') ? 'red' : 'green' }}>
          {responseMessage}
        </div>
      )}

      
    </div>
  );
}