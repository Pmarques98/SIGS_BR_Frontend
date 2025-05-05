import { useState, FormEvent, useContext } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/Home.module.scss';

import logoImg from '../../../public/cuidar.png';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/Button';
import { AuthContext } from '../../contexts/authContext';

import Link from 'next/link';

export default function Home() {
  const { signUpPatient } = useContext(AuthContext);

    const [cpf_patient, setCpfPatient] = useState('');
    const [cpf_advisor, setCpfAdvisor] = useState('');
    const [cellphone_advisor, setCellphoneAdvisor] = useState('');
    const [name_patient, setNamePatient] = useState('');
    const [loading, setLoading] = useState(false);

  async function signUpPatientHandle(event: FormEvent) {
    event.preventDefault();

    if (cpf_patient === '' || cpf_advisor === '' || cellphone_advisor === '' || name_patient === '') {
      alert('É necessário preencher todos os campos');
      return;
    }

    // validar se o CPF tem 11 dígitos
    if (cpf_patient.length !== 11) {
      alert('O CPF deve ter 11 dígitos');
      return;
    }

     // validar se o CPF tem 11 dígitos
     if (cpf_advisor.length !== 11) {
        alert('O CPF deve ter 11 dígitos');
        return;
      }

    // Verificação do formato do número de telefone
    const phoneRegex = /^[1-9]{2}[9][0-9]{8}$/;
    if (!phoneRegex.test(cellphone_advisor)) {
        alert('Por favor, insira um número de telefone válido no formato 11912345678');
        return;
    }

    setLoading(true);

    let data = {
        cpf_patient,
        cpf_advisor,
        cellphone_advisor,
        name_patient,
    };

    try {
      await signUpPatient(data);
    } catch (error) {
      if (error instanceof Error) {
        alert('CPF já cadastrado');
      } else {
        alert('Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title> POAP - Faça seu cadastro agora!</title>
      </Head>
      <div className={styles.containerCenter}>
        <Image
          src={logoImg}
          alt="Logo SIGS_BR"
          width={150} // ajuste conforme necessário
          height={150} // ajuste conforme necessário
        />
        <div className={styles.login}>
          <h1 className={styles.title}>POAP</h1> 
          <h2>Criando sua conta</h2>
          <form onSubmit={signUpPatientHandle}>
            <Input
              placeholder="Digite o CPF do paciente (ex: 12345678900)"
              type="text"
              value={cpf_patient}
              maxLength={11} // limitar a 11 caracteres
              onChange={(e) => setCpfPatient(e.target.value.replace(/\D/g, ''))} // remover caracteres não numéricos
            />
                        <Input
              placeholder="Digite o CPF do responsável (ex: 12345678900)"
              type="text"
              value={cpf_advisor}
              maxLength={11} // limitar a 11 caracteres
              onChange={(e) => setCpfAdvisor(e.target.value.replace(/\D/g, ''))} // remover caracteres não numéricos
            />
            <Input
              placeholder="Digite seu número de telefone do responsável (ex: 11912345678)"
              type="text"
              value={cellphone_advisor}
              onChange={(e) => setCellphoneAdvisor(e.target.value)}
            />
            <Input
              placeholder="Digite o nome do paciente"
              type="text"
              value={name_patient}
              onChange={(e) => setNamePatient(e.target.value)}
            />
            <Button type="submit" loading={loading}>
              Cadastro
            </Button>
          </form>
          <Link href="/" legacyBehavior>
            <a className={styles.text}>Já possui uma conta? Faça o login</a>
          </Link>
        </div>
      </div>
    </>
  );
}
