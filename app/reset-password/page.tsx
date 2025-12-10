import { Suspense } from "react"
import ResetPasswordForm from "./reset-password-form"

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[50dvh] w-full px-4 py-6 md:py-6 bg-[url('/back2.png')]">
          <div className="mx-auto max-w-md">
            <div className="rounded-lg border bg-background p-6 text-center shadow-lg">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
