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
        fetchPrivateReports();
      }
    } catch (err: any) {
      setResponseMessage('Erro ao cadastrar recomendação particular');
    }
  }

  async function fetchPrivateReports() {
    if (!cpfPsychologist) return;
    setLoadingReports(true);
    try {
      const api = setAPIClient();
      const response = await api.post('/reports/psicologo', {
        cpf_psychologist: cpfPsychologist,
      });
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1rem'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        padding: '2rem 2rem 1.5rem 2rem',
        minWidth: 340,
        maxWidth: 700,
        width: '100%',
        margin: '0 auto'
      }}>
        <h1 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 24 }}>Escrever recomendação privada</h1>
        <form onSubmit={handleCreatePrivateRecommendation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Nome da criança"
            value={nameChild}
            onChange={(e) => setNameChild(e.target.value)}
            required
            style={{ borderRadius: 8, border: '1.5px solid #e3e3e3', padding: '0.7rem 1rem', fontSize: '1rem', background: '#f7fafd' }}
          />
          <input
            type="text"
            placeholder="CPF da criança"
            value={cpfChild}
            onChange={(e) => setCpfChild(e.target.value.replace(/\D/g, '').slice(0, 11))}
            maxLength={11}
            pattern="\d{11}"
            inputMode="numeric"
            style={{ borderRadius: 8, border: '1.5px solid #e3e3e3', padding: '0.7rem 1rem', fontSize: '1rem', background: '#f7fafd' }}
          />
          <textarea
            placeholder="Recomendação privada"
            value={report}
            onChange={(e) => setReport(e.target.value)}
            required
            style={{ borderRadius: 8, border: '1.5px solid #e3e3e3', padding: '0.7rem 1rem', fontSize: '1rem', background: '#f7fafd', minHeight: 80 }}
          />
          <button
            type="submit"
            style={{
              padding: '0.9rem 0',
              background: 'linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '1.1rem',
              cursor: 'pointer'
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
              textAlign: 'center'
            }}
          >
            {responseMessage}
          </div>
        )}

        <h2 style={{ marginTop: '2rem', color: '#1976d2' }}>Minhas recomendações privadas</h2>
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
                  <td>{rep.data ? new Date(rep.data).toLocaleString('pt-BR') : ''}</td>
                  <td>{rep.name_child}</td>
                  <td>{rep.cpf_child}</td>
                  <td>{rep.report}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#888' }}>Nenhuma recomendação particular encontrada.</p>
        )}
      </div>
    </div>
  );
}