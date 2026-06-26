"use server";

import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function login(username: string, password: string) {
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    return { error: "Invalid username or password" };
  }

  const data = await res.json();
  const cookieStore = await cookies();

  cookieStore.set("access_token", data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  cookieStore.set("refresh_token", data.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return { success: true, user: data.user };
}


export async function register(username: string, email: string, password: string) {
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    return { error: data };
  }

  // Registration succeeded but doesn't log the user in — reuse login()
  // so they're authenticated immediately after registering.
  return login(username, password);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) return null;

  const res = await fetch(`${BACKEND_URL}/api/v1/auth/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return null;

  return res.json();
}