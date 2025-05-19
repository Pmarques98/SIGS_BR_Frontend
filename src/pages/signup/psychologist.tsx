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
  const { signUpPsychologist } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [cellphone_number, setCellphone] = useState('');

  async function signUpHandlePsychologist(event: FormEvent) {
    event.preventDefault();

    if (name === '' || email === '' || password === '' || cellphone_number === '' || cpf === '') {
      alert('É necessário preencher todos os campos');
      return;
    }

    // validar se o CPF tem 11 dígitos
    if (cpf.length !== 11) {
      alert('O CPF deve ter 11 dígitos');
      return;
    }

    // Verificação do formato do número de telefone
    const phoneRegex = /^[1-9]{2}[9][0-9]{8}$/;
    if (!phoneRegex.test(cellphone_number)) {
      alert('Por favor, insira um número de telefone válido no formato 11912345678');
      return;
    }

    setLoading(true);

    let data = {
      name,
      email,
      password,
      cpf,
      cellphone_number // Corrigido para usar a chave correta
    };

    try {
      await signUpPsychologist(data);
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
          <h1 className={styles.title}>POAP</h1> {/*SIGS_BR*/}
          <h2>Criando sua conta</h2>
          <form onSubmit={signUpHandlePsychologist}>
            <Input
              placeholder="Digite seu nome"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Digite seu email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Digite seu cpf (ex: 12345678900)"
              type="text"
              value={cpf}
              maxLength={11}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))} // remover caracteres não numéricos
            />
            <Input
              placeholder="Digite sua senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              placeholder="Digite seu número de telefone (ex: 11912345678)"
              type="text"
              value={cellphone_number}
              maxLength={11}
              onChange={(e) => setCellphone(e.target.value)}
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