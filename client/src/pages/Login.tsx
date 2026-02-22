import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../auth/useAuth";


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const { login: saveToken } = useAuth();
  const navigate = useNavigate();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    try {
      const token = (await login(username, password)).accessToken;
      saveToken(token);
      navigate("/game");
    } catch (err: any) {
      setError(err.message);
    }
  }
  return (
    <div>
      <h1>Login</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        
        <button type="submit">Login</button>
      </form>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
