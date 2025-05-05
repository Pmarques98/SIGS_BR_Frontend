import { FormEvent, useContext, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.scss';

import logoImg from '../../public/cuidar.png';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/Button';

import { AuthContext } from '@/contexts/authContext';

import Link from 'next/link';

export default function Home() {
  const { signIn } = useContext(AuthContext);

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    // verificar se o usuario mandou algo na pagina de login
    if (password === '' || cpf === '') {
      alert('É preciso preencher seus dados');
      return;
    }

    // validar se o CPF tem 11 dígitos
    if (cpf.length !== 11) {
      alert('O CPF deve ter 11 dígitos');
      return;
    }

    setLoading(true);

    let data = {
      cpf,
      password,
    };

    try {
      await signIn(data);
    } catch (error) {
      if (error instanceof Error) {
        alert('Email ou senha invalidos');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title> POAP - Faça seu login</title>
      </Head>
      <div className={styles.containerCenter}>
        <Image
          src={logoImg}
          alt="Logo POAP"
          width={150} // ajuste conforme necessário
          height={150} // ajuste conforme necessário
        />
        <div className={styles.login}>
          <h1 className={styles.title}>POAP</h1> {/*SIGS_BR*/}
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <Input
              placeholder="Digite seu cpf (ex: 12345678900)"
              type="text"
              value={cpf}
              maxLength={11} // limitar a 11 caracteres
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))} // remover caracteres não numéricos
            />
            <Input
              placeholder="Digite sua senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" loading={loading}>
              Acessar
            </Button>
          </form>

          <Link href="/signup/signupType" legacyBehavior>
            <a className={styles.text}>Não possui uma conta? Cadastre-se</a>
          </Link>
        </div>
      </div>
    </>
  );
}