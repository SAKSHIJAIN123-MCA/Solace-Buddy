"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { type ICountry, type IState, type ICity, type IArea } from "@/lib/models/location"

type LocationType = 'countries' | 'states' | 'cities' | 'areas';

export default function ContactAddressPage() {
  const { toast } = useToast()
  const [countries, setCountries] = useState<ICountry[]>([])
  const [states, setStates] = useState<IState[]>([])
  const [cities, setCities] = useState<ICity[]>([])
  const [areas, setAreas] = useState<IArea[]>([])

  const [activeTab, setActiveTab] = useState<LocationType>("countries")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null) // Can be ICountry, IState, ICity, IArea
  const [formData, setFormData] = useState({ name: "", code: "", parentId: "" })
  const [loading, setLoading] = useState(true)
  const [dialogLoading, setDialogLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [countriesRes, statesRes, citiesRes, areasRes] = await Promise.all([
        fetch('/api/locations/countries'),
        fetch('/api/locations/states'),
        fetch('/api/locations/cities'),
        fetch('/api/locations/areas'),
      ])

      const [countriesData, statesData, citiesData, areasData] = await Promise.all([
        countriesRes.json(),
        statesRes.json(),
        citiesRes.json(),
        areasRes.json(),
      ])

      if (countriesData.success) setCountries(countriesData.data)
      if (statesData.success) setStates(statesData.data)
      if (citiesData.success) setCities(citiesData.data)
      if (areasData.success) setAreas(areasData.data)

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch location data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({ name: "", code: "", parentId: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    let parentId = ""
    if (activeTab === "states" && item.country) parentId = item.country._id || item.country
    if (activeTab === "cities" && item.state) parentId = item.state._id || item.state
    if (activeTab === "areas" && item.city) parentId = item.city._id || item.city

    setFormData({
      name: item.name,
      code: item.code || "",
      parentId: parentId,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (type: LocationType, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/locations/${type}/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: `${type.slice(0, -1)} deleted successfully.` })
        fetchData()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to delete ${type.slice(0, -1)}.`, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setDialogLoading(true)
    const method = editingItem ? 'PUT' : 'POST'
    const url = editingItem ? `/api/locations/${activeTab}/${editingItem._id}` : `/api/locations/${activeTab}`

    let body: any = { name: formData.name }
    if (activeTab === "countries") {
      body.code = formData.code
    } else if (activeTab === "states") {
      body.countryId = formData.parentId
    } else if (activeTab === "cities") {
      body.stateId = formData.parentId
    } else if (activeTab === "areas") {
      body.cityId = formData.parentId
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `${activeTab.slice(0, -1)} ${editingItem ? "updated" : "created"} successfully.`,
        })
        setIsDialogOpen(false)
        resetFormData()
        fetchData()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${editingItem ? "update" : "create"} ${activeTab.slice(0, -1)}.`, variant: "destructive" })
    } finally {
      setDialogLoading(false)
    }
  }

  const resetFormData = () => {
    setFormData({ name: "", code: "", parentId: "" })
  }

  const getParentOptions = () => {
    switch (activeTab) {
      case "states":
        return countries
      case "cities":
        return states
      case "areas":
        return cities
      default:
        return []
    }
  }

  const getParentName = (item: any) => {
    switch (activeTab) {
      case "states":
        return (item.country as ICountry)?.name || ""
      case "cities":
        return (item.state as IState)?.name || ""
      case "areas":
        return (item.city as ICity)?.name || ""
      default:
        return ""
    }
  }

  const getCurrentTabData = () => {
    switch (activeTab) {
      case "countries": return countries
      case "states": return states
      case "cities": return cities
      case "areas": return areas
      default: return []
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Address Management</h1>
        <p className="text-muted-foreground">Manage countries, states, cities, and areas for contact addresses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location Hierarchy</CardTitle>
          <CardDescription>Manage the geographical hierarchy for contact addresses</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LocationType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="countries">Countries</TabsTrigger>
              <TabsTrigger value="states">States</TabsTrigger>
              <TabsTrigger value="cities">Cities</TabsTrigger>
              <TabsTrigger value="areas">Areas</TabsTrigger>
            </TabsList>

            {["countries", "states", "cities", "areas"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium capitalize">{tab}</h3>
                  <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add {tab.slice(0, -1)}
                  </Button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  </div>
                ) : getCurrentTabData().length === 0 ? (
                  <p className="text-center text-muted-foreground">No {tab} found. Add one!</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        {tab === "countries" && <TableHead>Code</TableHead>}
                        {tab !== "countries" && <TableHead>Parent</TableHead>}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCurrentTabData().map((item: any) => (
                        <TableRow key={item._id}> {/* Use _id for MongoDB documents */}
                          <TableCell className="font-medium">{item.name}</TableCell>
                          {tab === "countries" && <TableCell>{item.code}</TableCell>}
                          {tab !== "countries" && <TableCell>{getParentName(item)}</TableCell>}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(activeTab, item._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"} {activeTab.slice(0, -1)}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? "Update" : "Create a new"} {activeTab.slice(0, -1)} entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={`Enter ${activeTab.slice(0, -1)} name`}
                required
              />
            </div>
            {activeTab === "countries" && (
              <div>
                <Label htmlFor="code">Country Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="Enter country code (e.g., IN, US)"
                  required
                />
              </div>
            )}
            {activeTab !== "countries" && (
              <div>
                <Label htmlFor="parent">
                  {activeTab === "states" ? "Country" : activeTab === "cities" ? "State" : "City"}
                </Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, parentId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select ${
                        activeTab === "states" ? "country" : activeTab === "cities" ? "state" : "city"
                      }`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getParentOptions().map((option: any) => (
                      <SelectItem key={option._id} value={option._id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={dialogLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={dialogLoading}>
              {dialogLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
