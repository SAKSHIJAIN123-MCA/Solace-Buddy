"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, Plus } from "lucide-react"

interface Policy {
  _id: string
  title: string
  description: string
}

export default function PrivacyPolicyList() {
  const [policies, setPolicies] = useState<Policy[]>([])

  const fetchPolicies = () => {
    fetch("/api/admin/privacypolicy")
      .then((res) => res.json())
      .then(setPolicies)
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this policy?")) {
      await fetch(`/api/admin/privacypolicy/${id}`, {
        method: "DELETE",
      })
      fetchPolicies() // Refresh the list after deletion
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Privacy Policies</CardTitle>
        <Link href="/admin/privacypolicy/new">
          <Button>
             <Plus className="h-4 w-4 mr-2" />
            Add New Policy</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((p) => (
              <TableRow key={p._id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>{p.description.slice(0, 100)}...</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/privacypolicy/${p._id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(p._id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
