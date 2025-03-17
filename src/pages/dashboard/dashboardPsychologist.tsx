import { useRouter } from 'next/router';

export default function DashboardPsychologist() {
  const router = useRouter();
  const { email } = router.query;

  return (
    <div>
      <h1>Bem vindo a pagina principal do psicologo</h1>
      {email && <p>Conta: {email}</p>}
    </div>
  );
}