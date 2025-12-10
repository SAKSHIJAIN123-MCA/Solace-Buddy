import { Suspense } from "react"
import SignupForm from "@/components/signupform"

export const dynamic = "force-dynamic"

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-10">Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
