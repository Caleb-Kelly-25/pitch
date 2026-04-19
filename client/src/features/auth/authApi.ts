const API_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/auth`

export async function signup(username: string, password: string) {
  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error("Signup failed")
  return res.json()
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error("Login failed")
  return res.json()
}
