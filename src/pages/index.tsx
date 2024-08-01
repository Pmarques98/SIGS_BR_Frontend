import { FormEvent, useContext, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.scss'

import logoImg from '../../public/cuidar.png'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/Button'

import { AuthContext } from '@/contexts/authContext'

import Link from 'next/link';

export default function Home() {
  const { signIn } = useContext(AuthContext)

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent){

    event?.preventDefault();

    //verificar se o usuario mandou algo na pagina de login
    if(email === '' || password === ''){
      alert("É preciso preencher seus dados")
      return;
    }

    setLoading(true);
  
    let data = {
        email,
        password      
    }
    await signIn(data)

    setLoading(false);
  }
  

  return (
    <>
    <Head>
      <title> SIGS_BR - Faça seu login</title>
    </Head>
    <div className= {styles.containerCenter}>
      <Image src={logoImg} 
          alt="Logo SIGS_BR" 
          width={150}  // ajuste conforme necessário
          height={150} // ajuste conforme necessário
          />
      <div className={styles.login}>
        <h1 className={styles.title}>SIGS_BR</h1> {/*SIGS_BR*/}
        <h2>Login</h2>
         <form onSubmit={handleLogin}>
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

          <Button
            type="submit"
            loading={loading}
          >
            Acessar
          </Button>

          </form>

            <Link href="/signup" legacyBehavior>
              <a className={styles.text}>Não possui uma conta? Cadastre-se</a>
            </Link>

        </div>
    </div>

    </>
  );
}
