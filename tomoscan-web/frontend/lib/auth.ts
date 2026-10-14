import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";   // add: npm i jwt-decode

interface TokenPayload {
  sub: string;
  role: "member" | "admin";
  exp: number;
}

export function getTokenPayload(): TokenPayload | null {
  const token = Cookies.get("access_token");
  if (!token) return null;
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getTokenPayload()?.role === "admin";
}

export function isAuthenticated(): boolean {
  const p = getTokenPayload();
  if (!p) return false;
  return p.exp * 1000 > Date.now();
}

export function logout() {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
}
