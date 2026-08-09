"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function signInAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (username !== "admin" || password !== "admin") {
    redirect("/sign-in?error=invalid-credentials");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "admin-demo", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  redirect("/admin");
}
