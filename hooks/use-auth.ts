"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useAuth() {
  const { data, isLoading, mutate } = useSWR("/api/student/auth/me", fetcher)
  const authenticated = Boolean(data?.authenticated)
  const student = data?.student || null

  async function logout() {
    await fetch("/api/student/auth/logout", { method: "POST" })
    await mutate()
  }

  return { authenticated, student, isLoading, logout, refresh: mutate }
}
