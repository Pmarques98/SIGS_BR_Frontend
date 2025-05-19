import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { setAPIClient } from '../../services/apiBuilder';

type Report = {
  id: number;
  name_child: string;
  cpf_user: string;
  cpf_child: string; // Adicionado campo cpf_child
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
    fetchReports(); // Busca inicial
    pollingRef.current = setInterval(fetchReports, 10000); // A cada 10 segundos
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current); // Limpa o intervalo ao desmontar o componente
    };
  }, [cpf]);

  useEffect(() => {
      if (responseMessage) {
        const timer = setTimeout(() => setResponseMessage(null), 5000); 
        return () => clearTimeout(timer);
      }
    }, [responseMessage]);


  return (
    <div style={{ padding: '20px', color: '#fff' }}> {/* Alterado para texto branco */}
      <h1>Recomendações</h1>
      {loading && <p>Carregando...</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
  
      {reports.length > 0 ? (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', color: '#fff' }}>
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
                <td>{report.cpf_user}</td> {/* Exibindo CPF do usuário */}
                <td>{report.cpf_child}</td> {/* Exibindo CPF da criança */}
                <td>{report.cpf_psychologist}</td>
                <td>{report.nome_psychologist}</td>
                <td>{report.cellphone_number}</td>
                <td>{new Date(report.data).toLocaleString()}</td>
                <td>{report.report}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>Nenhuma recomendação foi encontrada.</p>
      )}
    </div>
  );
}