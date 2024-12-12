import { jwtDecode } from 'jwt-decode';

export function hashCode(value:string) {
    var hash = 0,
      i, chr;
    if (value.length === 0) return hash;
    for (i = 0; i < value.length; i++) {
      chr = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  }

export async function createToken(username:string, password:string)
{
    const response = await fetch('https://tandemsmbackend.netlify.app/.netlify/functions/server/login', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ "username":username, "password":hashCode(password) })
      });
      const data = await response.json();
      
      if (data.token) localStorage.setItem('jwt_token', data.token);

    return data.token;
}

export function isTokenExpired(token:string) 
{
    try 
    {
        const decoded = jwtDecode(token);
        const currentTime:number = Date.now() / 1000;
        if(decoded.exp) return  decoded.exp < currentTime;
        return true;
        
    } 
    catch (error) 
    {
        return true;
    }
}

export async function getToken()
{
    let token = localStorage.getItem('jwt_token') ?? "";
    if(isTokenExpired(token))
    {
       const newToken = await createToken('prueba','1234'); 
       //esto esta quemado pero deberia enroturse a un formulario que solicite usuario y clave
       token = newToken;
    }

    return token;
}
