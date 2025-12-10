"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function NewPrivacyPolicy() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleCreate = async () => {
    await fetch("/api/admin/privacypolicy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })
    router.push("/admin/privacypolicy")
  }

  return (
   <Card className="w-full">

      <CardHeader>
        <CardTitle>Create New Privacy Policy</CardTitle>
        <CardDescription>Fill in the details for the new privacy policy.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter policy title" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter policy description"
            rows={8}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="bg-[#2e057f] text-white" onClick={handleCreate}>Create Policy</Button>
      </CardFooter>
    </Card>
  )
}
