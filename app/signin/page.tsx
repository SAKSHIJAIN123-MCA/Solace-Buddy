import { Suspense } from "react"
import type { ReactNode } from "react"
import LoginPage from "@/components/signin-page"

export const dynamic = "force-dynamic"

function Fallback(): ReactNode {
  // Minimal, accessible fallback while the client component reads search params
  return (
    <div className="min-h-[50dvh] w-full px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">Loading...</div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <LoginPage />
    </Suspense>
  )
}
