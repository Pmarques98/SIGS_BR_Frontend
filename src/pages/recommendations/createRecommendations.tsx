import { useRouter } from 'next/router';
import { useState } from 'react';
import { setAPIClient } from '../../services/apiBuilder';

export default function CreateRecommendations() {
  const router = useRouter();
  const { cpf } = router.query;
  const [nameChild, setNameChild] = useState('');
  const [cpfUser, setCpfUser] = useState('');
  const [cpfChild, setCpfChild] = useState('');
  const [cpfPsychologist, setCpfPsychologist] = useState(cpf || '');
  const [nomePsychologist, setNomePsychologist] = useState('');
  const [cellphoneNumber, setCellphoneNumber] = useState('');
  const [report, setReport] = useState('');
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  async function handleCreateRecommendation(e: React.FormEvent) {
    e.preventDefault();
    setResponseMessage(null);

    try {
      const api = setAPIClient();
      const response = await api.post('/reports', {
        name_child: nameChild,
        cpf_user: cpfUser,
        cpf_child: cpfChild,
        cpf_psychologist: cpfPsychologist,
        nome_psychologist: nomePsychologist,
        cellphone_number: cellphoneNumber,
        report,
      });

      if (response.data && response.data.error) {
        setResponseMessage(response.data.error);
      } else {
        setResponseMessage('Recomendação cadastrada com sucesso!');
        setNameChild('');
        setCpfUser('');
        setCpfChild('');
        setNomePsychologist('');
        setCellphoneNumber('');
        setReport('');
      }
    } catch (err: any) {
      setResponseMessage('Erro ao cadastrar recomendação');
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Escrever recomendação</h1>
      <form onSubmit={handleCreateRecommendation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Nome da criança"
          value={nameChild}
          onChange={(e) => setNameChild(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="CPF do usuário"
          value={cpfUser}
          onChange={(e) => setCpfUser(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="CPF da criança"
          value={cpfChild}
          onChange={(e) => setCpfChild(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nome do psicólogo"
          value={nomePsychologist}
          onChange={(e) => setNomePsychologist(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Número de telefone"
          value={cellphoneNumber}
          onChange={(e) => setCellphoneNumber(e.target.value)}
          required
        />
        <textarea
          placeholder="Recomendações a serem feitas" 
          value={report}
          onChange={(e) => setReport(e.target.value)}
          required
        />
        <button type="submit" style={{ padding: '0.5rem', backgroundColor: '#4caf50', color: '#fff', border: 'none' }}>
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
    </div>
  );
}