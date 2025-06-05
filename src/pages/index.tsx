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

    if (password === '' || cpf === '') {
      alert('É preciso preencher seus dados');
      return;
    }

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
        <title>POAP - Faça seu login</title>
      </Head>
      <div className={styles.containerCenter}>
        <div className={styles.login}>
          <Image
            src={logoImg}
            alt="Logo POAP"
            width={150}
            height={150}
            style={{ marginBottom: 16 }}
          />
          <h1 className={styles.title}>POAP</h1>
          <h2 className={styles.subtitle}>Login</h2>
          <form onSubmit={handleLogin}>
            <Input
              placeholder="Digite seu cpf (ex: 12345678900)"
              type="text"
              value={cpf}
              maxLength={11}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
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