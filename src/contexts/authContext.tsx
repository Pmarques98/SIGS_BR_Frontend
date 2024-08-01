import { createContext, ReactNode, useState } from 'react';
import { destroyCookie,setCookie,parseCookies } from 'nookies';
import Router from 'next/router';
import {api} from '../services/apiClient'



type AuthContextData = {
    user: UserProps | null;
    isAuthenticated: boolean;
    signIn: (credentials: SignInProps) => Promise<void>;
    signOut: () => void;
    signUp: (credentials: SignUpProps) => Promise<void>;
}

type UserProps = {
    id: string;
    name: string;
    email: string;
}

type SignInProps = {
    email: string;
    password: string; 
}

type AuthProviderProps = {
    children: ReactNode;
}

type SignUpProps = {
    name: string;
    email: string;
    password: string;    
}

export const AuthContext = createContext({} as AuthContextData)

export function signOut(){
try{
    destroyCookie(undefined,'@sistemasaude.token')
    Router.push('/')
}catch{
    console.log('Aconteceu um erro ao deslogar')
}    
}

export function AuthProvider({children} : AuthProviderProps){

    const [user, setUser] = useState<UserProps | null>(null);
    const isAuthenticated = !!user;

    //função de login
    async function signIn({email,password}: SignInProps){
        try{
            const response = await api.post('/login',{
                email,
                password
            })

            const {id,name, token} = response.data
            setCookie(undefined, '@sistemasaude.token', token,{
                maxAge: 60 * 24 * 60 * 20 , // expira em 20 dias
                path: "/" 
            })

            setUser({
                id,
                name,
                email                
            })

            //Definir o token passado para todas as requisições 
            api.defaults.headers['Authorization'] = `Bearer ${token}`

            //Direciona o usuario para o /dashboard
            Router.push('/dashboard')

            console.log(response.data);
        }catch(erro){
            console.log("Erro ao tentar o acesso", erro)
        }
    }

    //função de cadastro
    async function signUp({name, email, password}: SignUpProps) {
        try{
            const response = await api.post('/cadastro',{
                name,
                email,
                password
            })
            console.log("Cadastro concluido")

            Router.push('/')
        }catch(erro){
            console.log("erro ao cadastrar", erro)
        }
    }

    return(
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, signUp}}>
        {children}
    </AuthContext.Provider>
    )
}