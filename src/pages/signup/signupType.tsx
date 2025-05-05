import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../../styles/Home.module.scss';
import { Button } from '../../components/ui/Button';

export default function SignupType() {
  const router = useRouter();

  const handleSelectType = (type: 'paciente' | 'psicologo' | 'responsavel') => {
    if (type === 'responsavel') {
      router.push('/signup/user');
    }
    else if(type === 'psicologo') {
      router.push(`/signup/psychologist`);
    }
    else {
      router.push('/signup/patient');
    }
  };

  return (
    <>
      <Head>
        <title> POAP - Escolha seu tipo de acesso</title>
      </Head>
      <div className={styles.containerCenter}>
        <div className={styles.login}>
          <h1 className={styles.title}>POAP</h1>
          <h2>Qual acesso gostaria de ter?</h2>
          <div className={styles.buttonContainer}>
            <Button onClick={() => handleSelectType('responsavel')}>Responsável</Button>
            <Button onClick={() => handleSelectType('psicologo')}>Psicologo</Button>
            <Button onClick={() => handleSelectType('paciente')}>Paciente</Button>
          </div>
        </div>
      </div>
    </>
  );
}