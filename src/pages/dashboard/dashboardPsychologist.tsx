import { useRouter } from 'next/router';
import { useState } from 'react';
import { setAPIClient } from '../../services/apiBuilder';

export default function DashboardPsychologist() {
  const router = useRouter();
  const { cpf } = router.query;

  const [cpfPsychologist, setCpfPsychologist] = useState('');
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para aceitar consulta
  const [acceptId, setAcceptId] = useState('');
  const [acceptCpfPsychologist, setAcceptCpfPsychologist] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptResponse, setAcceptResponse] = useState<string | null>(null);

  // Estados para alterar link do meets
  const [editId, setEditId] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editResponse, setEditResponse] = useState<string | null>(null);

  // Estados para adicionar report
  const [reportNameChild, setReportNameChild] = useState('');
  const [reportCpfUser, setReportCpfUser] = useState('');
  const [reportCpfPsychologist, setReportCpfPsychologist] = useState('');
  const [reportNomePsychologist, setReportNomePsychologist] = useState('');
  const [reportCellphone, setReportCellphone] = useState('');
  const [reportText, setReportText] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportResponse, setReportResponse] = useState<string | null>(null);
  const [reportResult, setReportResult] = useState<any | null>(null);

  async function handleListConsultations() {
    setLoading(true);
    try {
      const api = setAPIClient();
      const response = await api.post('/dashboard/psicologo', {
        cpf_psychologist: cpfPsychologist,
      });
      setConsultations(Array.isArray(response.data.unassignedConsultations) ? response.data.unassignedConsultations : []);
    } catch (err) {
      alert('Erro ao buscar solicitações');
      setConsultations([]);
    }
    setLoading(false);
  }

  async function handleAcceptConsultation(e: React.FormEvent) {
    e.preventDefault();
    setAcceptLoading(true);
    setAcceptResponse(null);
    try {
      const api = setAPIClient();
      const response = await api.post('/consulta/aceitar', {
        id: Number(acceptId),
        cpf_psychologist: acceptCpfPsychologist,
      });
      if (response.data && response.data.message) {
        setAcceptResponse(response.data.message);
      } else {
        setAcceptResponse('Consulta aceita com sucesso!');
      }
      setAcceptId('');
      handleListConsultations();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setAcceptResponse(err.response.data.error);
      } else {
        setAcceptResponse('Erro ao aceitar consulta');
      }
    }
    setAcceptLoading(false);
  }

  async function handleEditMeets(e: React.FormEvent) {
    e.preventDefault();
    setEditLoading(true);
    setEditResponse(null);
    try {
      const api = setAPIClient();
      const response = await api.post('/consulta/alterarMeets', {
        id: Number(editId),
        link_meets: editLink,
      });
      if (response.data && response.data.message) {
        setEditResponse(response.data.message);
      } else {
        setEditResponse('Link do Meets alterado com sucesso!');
      }
      setEditId('');
      setEditLink('');
      handleListConsultations();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setEditResponse(err.response.data.error);
      } else {
        setEditResponse('Erro ao alterar link do Meets');
      }
    }
    setEditLoading(false);
  }

  async function handleAddReport(e: React.FormEvent) {
    e.preventDefault();
    setReportLoading(true);
    setReportResponse(null);
    setReportResult(null);
    try {
      const api = setAPIClient();
      const response = await api.post('/reports', {
        name_child: reportNameChild,
        cpf_user: reportCpfUser,
        cpf_psychologist: reportCpfPsychologist,
        nome_psychologist: reportNomePsychologist,
        cellphone_number: reportCellphone,
        report: reportText,
      });
      if (response.data && response.data.id) {
        setReportResponse('Relatório adicionado com sucesso!');
        setReportResult(response.data);
      } else {
        setReportResponse('Relatório adicionado!');
        setReportResult(null);
      }
      // Limpa os campos
      setReportNameChild('');
      setReportCpfUser('');
      setReportCpfPsychologist('');
      setReportNomePsychologist('');
      setReportCellphone('');
      setReportText('');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setReportResponse(err.response.data.error);
      } else {
        setReportResponse('Erro ao adicionar relatório');
      }
      setReportResult(null);
    }
    setReportLoading(false);
  }

  return (
    <div>
      <h1>Bem vindo a pagina principal do psicologo</h1>
      {cpf && <p>Conta: {cpf}</p>}

      <h2>Listar solicitações de consulta</h2>
      <input
        placeholder="CPF do psicólogo"
        value={cpfPsychologist}
        onChange={e => setCpfPsychologist(e.target.value)}
      />
      <button onClick={handleListConsultations} disabled={loading}>
        {loading ? 'Buscando...' : 'Listar solicitações'}
      </button>

      <ul>
        {(Array.isArray(consultations) ? consultations : []).map((item, idx) => (
          <li key={idx}>
            <strong>ID:</strong> {item.id}<br />
            <strong>Descrição:</strong> {item.description}<br />
            <strong>CPF Usuário:</strong> {item.cpf_user}<br />
            <strong>CPF Paciente:</strong> {item.cpf_paciente}<br />
            <strong>Data:</strong> {item.data_consultation}<br />
            <strong>Link:</strong> <a href={item.link_meets} target="_blank" rel="noopener noreferrer">{item.link_meets}</a><br />
            <hr />
          </li>
        ))}
      </ul>

      <h2>Aceitar consulta</h2>
      <form onSubmit={handleAcceptConsultation}>
        <input
          placeholder="ID da consulta"
          value={acceptId}
          onChange={e => setAcceptId(e.target.value)}
          type="number"
          min="1"
          required
        />
        <input
          placeholder="CPF do psicólogo"
          value={acceptCpfPsychologist}
          onChange={e => setAcceptCpfPsychologist(e.target.value)}
          required
        />
        <button type="submit" disabled={acceptLoading || !acceptId || !acceptCpfPsychologist}>
          {acceptLoading ? 'Aceitando...' : 'Aceitar consulta'}
        </button>
      </form>
      {acceptResponse && (
        <div style={{ marginTop: 10, color: acceptResponse.toLowerCase().includes('erro') ? 'red' : 'green' }}>
          {acceptResponse}
        </div>
      )}

      <h2>Alterar link do Meets</h2>
      <form onSubmit={handleEditMeets}>
        <input
          placeholder="ID da consulta"
          value={editId}
          onChange={e => setEditId(e.target.value)}
          type="number"
          min="1"
          required
        />
        <input
          placeholder="Novo link do Meets"
          value={editLink}
          onChange={e => setEditLink(e.target.value)}
          required
        />
        <button type="submit" disabled={editLoading || !editId || !editLink}>
          {editLoading ? 'Alterando...' : 'Alterar link'}
        </button>
      </form>
      {editResponse && (
        <div style={{ marginTop: 10, color: editResponse.toLowerCase().includes('erro') ? 'red' : 'green' }}>
          {editResponse}
        </div>
      )}

      <h2>Adicionar relatório</h2>
      <form onSubmit={handleAddReport}>
        <input
          placeholder="Nome da criança"
          value={reportNameChild}
          onChange={e => setReportNameChild(e.target.value)}
          required
        />
        <input
          placeholder="CPF do usuário"
          value={reportCpfUser}
          onChange={e => setReportCpfUser(e.target.value)}
          required
        />
        <input
          placeholder="CPF do psicólogo"
          value={reportCpfPsychologist}
          onChange={e => setReportCpfPsychologist(e.target.value)}
          required
        />
        <input
          placeholder="Nome do psicólogo"
          value={reportNomePsychologist}
          onChange={e => setReportNomePsychologist(e.target.value)}
          required
        />
        <input
          placeholder="Celular"
          value={reportCellphone}
          onChange={e => setReportCellphone(e.target.value)}
          required
        />
        <textarea
          placeholder="Relatório"
          value={reportText}
          onChange={e => setReportText(e.target.value)}
          required
        />
        <button type="submit" disabled={reportLoading}>
          {reportLoading ? 'Adicionando...' : 'Adicionar relatório'}
        </button>
      </form>
      {reportResponse && (
        <div style={{ marginTop: 10, color: reportResponse.toLowerCase().includes('erro') ? 'red' : 'green' }}>
          {reportResponse}
        </div>
      )}
      {reportResult && (
        <pre style={{ background: '#f4f4f4', padding: 10, marginTop: 10 }}>
          {JSON.stringify(reportResult, null, 2)}
        </pre>
      )}
    </div>
  );
}