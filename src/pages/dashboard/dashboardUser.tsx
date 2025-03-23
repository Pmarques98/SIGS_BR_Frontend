import { useRouter } from 'next/router';

export default function DashboardUser() {
  const router = useRouter();
  const { cpf } = router.query;

  return (
    <div>
      <h1>Bem vindo a pagina principal do usuario</h1>
      {cpf && <p>Conta: {cpf}</p>}
    </div>
  );
}