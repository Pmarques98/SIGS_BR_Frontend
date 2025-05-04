import { useRouter } from 'next/router';
import { useState } from 'react';
import { setAPIClient } from '../../services/apiBuilder';

export default function DashboardUser() {
  const router = useRouter();
  const { cpf } = router.query;

  const [description, setDescription] = useState('');
  const [cpfPaciente, setCpfPaciente] = useState('');
  const [dataConsultation, setDataConsultation] = useState('');

  async function handleCreateConsultation(e: React.FormEvent) {
    e.preventDefault();
    try {
      const api = setAPIClient();
      await api.post('/consulta', {
        description,
        cpf_user: cpf,
        cpf_paciente: cpfPaciente,
        data_consultation: dataConsultation,
      });
      alert('Consulta criada com sucesso!');
      setDescription('');
      setCpfPaciente('');
      setDataConsultation('');
    } catch (err) {
      alert('Erro ao criar consulta');
    }
  }

  return (
    <div>
      <h1>Bem vindo a pagina principal do usuario</h1>
      {cpf && <p>Conta: {cpf}</p>}

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
    </div>
  );
}