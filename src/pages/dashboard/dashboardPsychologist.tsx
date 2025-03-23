import { useRouter } from 'next/router';

export default function DashboardPsychologist() {
  const router = useRouter();
  const { cpf } = router.query;

  return (
    <div>
      <h1>Bem vindo a pagina principal do psicologo</h1>
      {cpf && <p>Conta: {cpf}</p>}
    </div>
  );
}