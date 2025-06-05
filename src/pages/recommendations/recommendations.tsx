import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { setAPIClient } from '../../services/apiBuilder';

type Report = {
  id: number;
  name_child: string;
  cpf_user: string;
  cpf_child: string;
  cpf_psychologist: string;
  nome_psychologist: string;
  cellphone_number: string;
  data: string;
  report: string;
};

export default function RecommendationsPage() {
  const router = useRouter();
  const { cpf } = router.query;

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchReports() {
    if (!cpf) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const api = setAPIClient();
      const response = await api.post('/reports/aceitos', {
        cpf_user: cpf,
      });
      setReports(response.data || []);
    } catch (err: any) {
      setResponseMessage('Erro ao buscar relatórios dos psicólogos.');
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!cpf) return;
    fetchReports();
    pollingRef.current = setInterval(fetchReports, 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [cpf]);

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
        maxWidth: 900,
        width: '100%',
        margin: '0 auto'
      }}>
        <h1 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 24 }}>Recomendações</h1>
        {loading && <p>Carregando...</p>}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

        {reports.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome da Criança</th>
                <th>CPF do Usuário</th>
                <th>CPF da Criança</th>
                <th>CPF do Psicólogo</th>
                <th>Nome do Psicólogo</th>
                <th>Telefone</th>
                <th>Data</th>
                <th>Relatório</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.name_child}</td>
                  <td>{report.cpf_user}</td>
                  <td>{report.cpf_child}</td>
                  <td>{report.cpf_psychologist}</td>
                  <td>{report.nome_psychologist}</td>
                  <td>{report.cellphone_number}</td>
                  <td>{new Date(report.data).toLocaleString('pt-BR')}</td>
                  <td>{report.report}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && <p style={{ color: '#888' }}>Nenhuma recomendação foi encontrada.</p>
        )}
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
      </div>
    </div>
  );
}