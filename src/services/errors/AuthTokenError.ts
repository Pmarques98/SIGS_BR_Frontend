export class AuthTokenError extends Error{
    constructor(){
        super('Error com token de autenticação.')
    }
}