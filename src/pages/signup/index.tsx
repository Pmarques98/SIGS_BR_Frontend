import Head from 'next/head'
import Image from 'next/image'
import styles from '../../styles/Home.module.scss'

import logoImg from '../../../public/cuidar.png'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/Button'

import Link from 'next/link';

export default function Home() {
  return (
    <>
    <Head>
      <title> SIGS_BR - Faça seu cadastro agora!</title>
    </Head>
    <div className= {styles.containerCenter}>
      <Image src={logoImg} 
          alt="Logo SIGS_BR" 
          width={150}  // ajuste conforme necessário
          height={150} // ajuste conforme necessário
          />
      <div className={styles.login}>
        <h1 className={styles.title}>SIGS_BR</h1> {/*SIGS_BR*/}
        <h2>Criando sua conta</h2>
         <form>

         <Input
            placeholder="Digite seu nome"
            type="text"
          />

          <Input
            placeholder="Digite seu email"
            type="text"
          />
          <Input
            placeholder="Digite sua senha"
            type="password"
          />

          <Button
            type="submit"
            loading={false}
          >
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
