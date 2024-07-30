import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import styles from '../input/styles.module.scss'

interface InputProps extends InputHTMLAttributes<HTMLInputElement>{}
interface TextAreapProps extends TextareaHTMLAttributes<HTMLTextAreaElement>{}


export function Input({...rest}: InputProps){
    return(
        <input className={styles.input}{...rest}/>
    )
}

export function TextArea({...rest}: TextAreapProps){
    return(
        <textarea className={styles.input}{...rest}></textarea>
    )
}