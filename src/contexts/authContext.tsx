import { createContext, ReactNode, useState } from 'react';
import { destroyCookie, setCookie } from 'nookies';
import Router from 'next/router';
import { api } from '../services/apiClient';

type AuthContextData = {
  user: UserProps | null;
  isAuthenticated: boolean;
  signIn: (credentials: SignInProps) => Promise<void>;
  signOut: () => void;
  signUp: (credentials: SignUpProps) => Promise<void>;
  signUpPsychologist: (credentials: SignUpPsychologistProps) => Promise<void>;
  signUpPatient: (credentials: signUpPatientProps) => Promise<void>;
};

type UserProps = {
  id: string;
  name: string;
  cpf: string;
};

type SignInProps = {
  cpf: string;
  password: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

type SignUpProps = {
  name: string;
  email: string;
  cpf: string;
  password: string;
};

type SignUpPsychologistProps = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  cellphone_number: string;
};

type signUpPatientProps = {
  cpf_patient : String,
  cpf_advisor : String,
  cellphone_advisor : String,
  name_patient : String,
};

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  try {
    destroyCookie(undefined, '@sistemasaude.token');
    Router.push('/');
  } catch {
    console.log('Aconteceu um erro ao deslogar');
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null);
  const isAuthenticated = !!user;

  // função de login
  async function signIn({ cpf, password }: SignInProps) {
    try {
      const response = await api.post('/login', {
        cpf,
        password,
      });

      const { id, name, token, isUser } = response.data;
      setCookie(undefined, '@sistemasaude.token', token, {
        maxAge: 60 * 24 * 60 * 20, // expira em 20 dias
        path: '/',
      });

      setUser({
        id,
        name,
        cpf,
      });

      // Definir o token passado para todas as requisições
      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      // Direciona o usuario para o dashboard apropriado com o cpf na URL
      if (isUser) {
        Router.push(`/dashboard/dashboardUser?cpf=${cpf}`);
      } else {
        Router.push(`/dashboard/dashboardPsychologist?cpf=${cpf}`);
      }

      console.log(response.data);
    } catch (erro) {
      console.log('CPF ou senha inválidos');
      throw erro;
    }
  }

  // função de cadastro
  async function signUp({ name, email, password, cpf }: SignUpProps) {
    try {
      const response = await api.post('/cadastro/usuario', {
        name,
        email,
        password,
        cpf, 
      });
      console.log('Cadastro concluído');

      Router.push('/');
    } catch (erro) {
      console.log('Email já cadastrado');
      throw erro;
    }
  }

  async function signUpPsychologist({ name, email, password, cpf, cellphone_number }: SignUpPsychologistProps) {
    try {
      const response = await api.post('/cadastro/psicologo', {
        name,
        email,
        password,
        cpf,
        cellphone_number, 
      });
      console.log('Cadastro concluído');

      Router.push('/');
    } catch (erro) {
      console.log('Email já cadastrado');
      throw erro; 
    }
  }

  async function signUpPatient({ cpf_patient, cpf_advisor, cellphone_advisor, name_patient }: signUpPatientProps) {
    try {
      const response = await api.post('/cadastro/crianca', {
        cpf_crianca: cpf_patient,
        cpf_responsavel:  cpf_advisor,
        telefone_responsavel: cellphone_advisor,
        nome_crianca: name_patient
      });
      console.log('Cadastro concluído');

      Router.push('/');
    } catch (erro) {
      console.log('Email já cadastrado');
      throw erro; 
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, signIn, signOut, signUp, signUpPsychologist, signUpPatient }}
    >
      {children}
    </AuthContext.Provider>
  );
}