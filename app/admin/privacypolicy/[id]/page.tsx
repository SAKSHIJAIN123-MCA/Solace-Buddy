"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function EditPrivacyPolicy() {
  const { id } = useParams()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/privacypolicy/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title)
          setDescription(data.description)
        })
    }
  }, [id])

  const handleUpdate = async () => {
    await fetch(`/api/admin/privacypolicy/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })
    router.push("/admin/privacypolicy")
  }

  return (
   <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Privacy Policy</CardTitle>
        <CardDescription>Update the details for this privacy policy.</CardDescription>
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
        <Button className="bg-[#2e057f] text-white" onClick={handleUpdate}>Update Policy</Button>
      </CardFooter>
    </Card>
  )
}
