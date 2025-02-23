import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../../styles/Home.module.scss';
import { Button } from '../../components/ui/Button';

export default function SignupType() {
  const router = useRouter();

  const handleSelectType = (type: 'paciente' | 'psicologo') => {
    if (type === 'paciente') {
      router.push('/signup');
    } else {
      router.push(`/signup/psicologo`);
    }
  };

  return (
    <>
      <Head>
        <title> SIGS_BR - Escolha seu tipo de acesso</title>
      </Head>
      <div className={styles.containerCenter}>
        <div className={styles.login}>
          <h1 className={styles.title}>SIGS_BR</h1>
          <h2>Qual acesso gostaria de ter?</h2>
          <div className={styles.buttonContainer}>
            <Button onClick={() => handleSelectType('paciente')}>Paciente</Button>
            <Button onClick={() => handleSelectType('psicologo')}>Psicologo</Button>
          </div>
        </div>
      </div>
    </>
  );
}