import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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
  const [childStatus, setChildStatus] = useState('leve');


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
        status: childStatus,
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

   useEffect(() => {
      if (responseMessage) {
        const timer = setTimeout(() => setResponseMessage(null), 5000); 
        return () => clearTimeout(timer);
      }
    }, [responseMessage]);
    
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
          maxLength={11}
          pattern="\d{11}"
          inputMode="numeric"
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
            maxLength={11}
            pattern="\d{11}"
            inputMode="numeric"
            required
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label htmlFor="childStatus"><strong>Situação da criança:</strong></label>
          <select
            id="childStatus"
            value={childStatus}
            onChange={(e) => setChildStatus(e.target.value)}
            required
          >
            <option value="leve">Leve</option>
            <option value="moderado">Moderado</option>
            <option value="grave">Grave</option>
            <option value="critico">Crítico</option>
          </select>
        </div>
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