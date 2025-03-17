import { useRouter } from 'next/router';

export default function DashboardUser() {
  const router = useRouter();
  const { email } = router.query;

  return (
    <div>
      <h1>Bem vindo a pagina principal do usuario</h1>
      {email && <p>Conta: {email}</p>}
    </div>
  );
}