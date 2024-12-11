import { jwtDecode } from 'jwt-decode';

String.prototype.hashCode = function() {
    var hash = 0,
      i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  }

export async function createToken(username, password)
{
    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ "username":username, "password":password.hashCode() })
      });
      const data = await response.json();
      
      if (data.token) localStorage.setItem('jwt_token', data.token);

    return data.token;
}

export function isTokenExpired(token) 
{
    try 
    {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return  decoded.exp < currentTime;
    } 
    catch (error) 
    {
        return true;
    }
}

export async function getToken()
{
    let token = localStorage.getItem('jwt_token');
    if(isTokenExpired(token))
    {
       const newToken = await createToken('prueba','1234'); 
       //esto esta quemado pero deberia enroturse a un formulario que solicite usuario y clave
       token = newToken;
    }

    return token;
}