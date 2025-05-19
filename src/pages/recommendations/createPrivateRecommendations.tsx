import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { setAPIClient } from '../../services/apiBuilder';

export default function CreatePrivateRecommendations() {
  const router = useRouter();
  const { cpf } = router.query;

  const [nameChild, setNameChild] = useState('');
  const [cpfChild, setCpfChild] = useState('');
  const [cpfPsychologist, setCpfPsychologist] = useState(cpf || '');
  const [report, setReport] = useState('');
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  // Novo estado para recomendações particulares
  const [privateReports, setPrivateReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  async function handleCreatePrivateRecommendation(e: React.FormEvent) {
    e.preventDefault();
    setResponseMessage(null);

    try {
      const api = setAPIClient();
      const response = await api.post('/reports/exclusivo', {
        report,
        cpf_psychologist: cpfPsychologist,
        name_child: nameChild,
        cpf_child: cpfChild,
      });

      if (response.data && response.data.error) {
        setResponseMessage(response.data.error);
      } else {
        setResponseMessage('Recomendação particular cadastrada com sucesso!');
        setNameChild('');
        setCpfChild('');
        setReport('');
        fetchPrivateReports(); // Atualiza a lista após cadastrar
      }
    } catch (err: any) {
      setResponseMessage('Erro ao cadastrar recomendação particular');
    }
  }

  // Função para buscar recomendações particulares do psicólogo
  async function fetchPrivateReports() {
    if (!cpfPsychologist) return;
    setLoadingReports(true);
    try {
      const api = setAPIClient();
      const response = await api.post('/reports/psicologo', {
        cpf_psychologist: cpfPsychologist,
      });
      // Filtra apenas as recomendações particulares, se necessário
      if (Array.isArray(response.data)) {
        setPrivateReports(response.data);
      } else {
        setPrivateReports([]);
      }
    } catch (err) {
      setPrivateReports([]);
    }
    setLoadingReports(false);
  }

  useEffect(() => {
    if (cpfPsychologist) {
      fetchPrivateReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpfPsychologist]);

  useEffect(() => {
    if (responseMessage) {
      const timer = setTimeout(() => setResponseMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [responseMessage]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Escrever recomendação privada</h1>
      <form onSubmit={handleCreatePrivateRecommendation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
            type="text"
            placeholder="Nome da criança"
            value={nameChild}
            onChange={(e) => setNameChild(e.target.value)}
            required
        />
        <input
            type="text"
            placeholder="CPF da criança"
            value={cpfChild}
            onChange={(e) => setCpfChild(e.target.value)}
            maxLength={11}
            pattern="\d{11}"
            inputMode="numeric"
        />
        <textarea
          placeholder="Recomendação privada"
          value={report}
          onChange={(e) => setReport(e.target.value)}
          required
        />
        <button
          type="submit"
          style={{
            padding: '0.5rem',
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Cadastrar recomendação
        </button>
      </form>
      {responseMessage && (
        <div
          style={{
            marginTop: '1rem',
            color: responseMessage.toLowerCase().includes('erro') ? 'red' : 'green',
          }}
        >
          {responseMessage}
        </div>
      )}

      <h2 style={{ marginTop: '2rem' }}>Minhas recomendações privadas</h2>
      {loadingReports ? (
        <p>Carregando...</p>
      ) : privateReports.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }} border={1}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Nome da Criança</th>
              <th>CPF da Criança</th>
              <th>Recomendação</th>
            </tr>
          </thead>
          <tbody>
            {privateReports.map((rep: any) => (
              <tr key={rep.id}>
                <td>{rep.id}</td>
                <td>{rep.data ? new Date(rep.data).toLocaleString() : ''}</td>
                <td>{rep.name_child}</td>
                <td>{rep.cpf_child}</td>
                <td>{rep.report}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhuma recomendação particular encontrada.</p>
      )}
    </div>
  );
}