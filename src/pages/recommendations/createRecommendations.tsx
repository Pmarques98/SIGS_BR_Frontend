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
      if (err.response && err.response.data && err.response.data.error) {
        setResponseMessage(err.response.data.error);
      } else {
      setResponseMessage('Erro ao cadastrar recomendação');
      }
    }
  }

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
        <h1 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 24 }}>Escrever recomendação</h1>
        <form onSubmit={handleCreateRecommendation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            placeholder="CPF do usuário"
            value={cpfUser}
            onChange={(e) => setCpfUser(e.target.value.replace(/\D/g, '').slice(0, 11))}
            maxLength={11}
            pattern="\d{11}"
            inputMode="numeric"
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
            required
            style={{ borderRadius: 8, border: '1.5px solid #e3e3e3', padding: '0.7rem 1rem', fontSize: '1rem', background: '#f7fafd' }}
          />
          <input
            type="text"
            placeholder="Nome do psicólogo"
            value={nomePsychologist}
            onChange={(e) => setNomePsychologist(e.target.value)}
            required
            style={{ borderRadius: 8, border: '1.5px solid #e3e3e3', padding: '0.7rem 1rem', fontSize: '1rem', background: '#f7fafd' }}
          />
          <input
            type="text"
            placeholder="Número de telefone"
            value={cellphoneNumber}
            onChange={(e) => setCellphoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
            maxLength={11}
            pattern="\d{11}"
            inputMode="numeric"
            required
            style={{ borderRadius: 8, border: '1.5px solid #e3e3e3', padding: '0.7rem 1rem', fontSize: '1rem', background: '#f7fafd' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label htmlFor="childStatus"><strong>Situação da criança:</strong></label>
            <select
              id="childStatus"
              value={childStatus}
              onChange={(e) => setChildStatus(e.target.value)}
              required
              style={{ borderRadius: 8, border: '1.5px solid #e3e3e3', padding: '0.7rem 1rem', fontSize: '1rem', background: '#f7fafd' }}
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
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2000,
              minWidth: 260,
              maxWidth: 400,
              color: responseMessage.toLowerCase().includes('não') ? '#d32f2f' : '#388e3c',
              background: responseMessage.toLowerCase().includes('não') ? '#ffebee' : '#e8f5e9',
              border: responseMessage.toLowerCase().includes('não') ? '1.5px solid #d32f2f' : '1.5px solid #388e3c',
              borderRadius: 12,
              padding: '1.2rem 2rem',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '1.1rem',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
              transition: 'opacity 0.3s'
            }}
          >
              {responseMessage}
            </div>
          )}
      </div>
    </div>
  );
}