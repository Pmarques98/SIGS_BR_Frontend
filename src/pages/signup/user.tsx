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
  const { signUp } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [gravity, setGravity] = useState<'leve' | 'moderado' | 'grave' | 'emergencial'>('leve');

  async function signUpHandle(event: FormEvent) {
    event.preventDefault();

    if (name === '' || email === '' || password === '') {
      alert('É necessário preencher todos os campos');
      return;
    }

    setLoading(true);

    let data = {
      name,
      email,
      password,
      gravity // Corrigido para usar a chave correta
    };

    try {
      await signUp(data);
    } catch (error) {
      if (error instanceof Error) {
        alert('Email ja cadastrado');
      } else {
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title> SIGS_BR - Faça seu cadastro agora!</title>
      </Head>
      <div className={styles.containerCenter}>
        <Image
          src={logoImg}
          alt="Logo SIGS_BR"
          width={150} // ajuste conforme necessário
          height={150} // ajuste conforme necessário
        />
        <div className={styles.login}>
          <h1 className={styles.title}>SIGS_BR</h1> {/*SIGS_BR*/}
          <h2>Criando sua conta</h2>
          <form onSubmit={signUpHandle}>
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
              placeholder="Digite sua senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className={styles.labelText}>Qual a gravidade de seus problemas?</p>
            <select
              value={gravity}
              onChange={(e) => setGravity(e.target.value as 'leve' | 'moderado' | 'grave' | 'emergencial')}
            >
              <option value="leve">Leve</option>
              <option value="moderado">Moderado</option>
              <option value="grave">Grave</option>
              <option value="emergencial">Emergencial</option>
            </select>
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