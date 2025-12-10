"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, UserCheck, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AffiliatesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [affiliates, setAffiliates] = useState([
    {
      id: 1,
      name: "Digital Marketing Pro",
      email: "contact@digitalmarketing.com",
      phone: "+91 9876543210",
      commissionRate: 10,
      totalEarnings: 25000,
      referrals: 15,
      status: "active",
      joinDate: "2024-01-01",
    },
    {
      id: 2,
      name: "Student Connect",
      email: "info@studentconnect.com",
      phone: "+91 8765432109",
      commissionRate: 8,
      totalEarnings: 18000,
      referrals: 12,
      status: "active",
      joinDate: "2023-12-15",
    },
  ])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    socialMedia: "",
    commissionRate: "",
    paymentMethod: "",
    bankAccount: "",
    ifscCode: "",
    panNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    marketingExperience: "",
    targetAudience: "",
    promotionStrategy: "",
    status: "pending",
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affiliate Management</h1>
          <p className="text-muted-foreground">Manage affiliate partners and commissions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Affiliate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Partners</CardTitle>
          <CardDescription>All affiliate marketing partners</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search affiliates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates
                .filter(
                  (affiliate) =>
                    affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4" />
                        <span>{affiliate.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{affiliate.email}</div>
                        <div className="text-xs text-muted-foreground">{affiliate.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{affiliate.commissionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{affiliate.totalEarnings.toLocaleString()}</TableCell>
                    <TableCell>{affiliate.referrals}</TableCell>
                    <TableCell>
                      <Badge variant={affiliate.status === "active" ? "default" : "secondary"}>
                        {affiliate.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(affiliate.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Affiliate Partner</DialogTitle>
            <DialogDescription>Register a new affiliate marketing partner</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-3">Basic Information</h3>
            </div>
            <div>
              <Label htmlFor="name">Name/Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter name or company name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="socialMedia">Social Media Profiles</Label>
              <Input
                id="socialMedia"
                value={formData.socialMedia}
                onChange={(e) => setFormData((prev) => ({ ...prev, socialMedia: e.target.value }))}
                placeholder="Instagram, Facebook, YouTube links"
              />
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-3 mt-4">Commission & Payment</h3>
            </div>
            <div>
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                value={formData.commissionRate}
                onChange={(e) => setFormData((prev) => ({ ...prev, commissionRate: e.target.value }))}
                placeholder="10"
                min="1"
                max="50"
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bankAccount">Bank Account Number</Label>
              <Input
                id="bankAccount"
                value={formData.bankAccount}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankAccount: e.target.value }))}
                placeholder="Enter bank account number"
              />
            </div>
            <div>
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={formData.ifscCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, ifscCode: e.target.value }))}
                placeholder="Enter IFSC code"
              />
            </div>
            <div>
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                value={formData.panNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, panNumber: e.target.value }))}
                placeholder="Enter PAN number"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-3 mt-4">Address Information</h3>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="Enter state"
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
                placeholder="Enter pincode"
              />
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-3 mt-4">Marketing Information</h3>
            </div>
            <div>
              <Label htmlFor="marketingExperience">Marketing Experience (Years)</Label>
              <Input
                id="marketingExperience"
                type="number"
                value={formData.marketingExperience}
                onChange={(e) => setFormData((prev) => ({ ...prev, marketingExperience: e.target.value }))}
                placeholder="5"
              />
            </div>
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData((prev) => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="Students, Working Professionals"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="promotionStrategy">Promotion Strategy</Label>
              <Textarea
                id="promotionStrategy"
                value={formData.promotionStrategy}
                onChange={(e) => setFormData((prev) => ({ ...prev, promotionStrategy: e.target.value }))}
                placeholder="Describe your marketing and promotion strategy"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const newAffiliate = {
                  id: Date.now(),
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  commissionRate: Number.parseInt(formData.commissionRate),
                  totalEarnings: 0,
                  referrals: 0,
                  status: formData.status,
                  joinDate: new Date().toISOString().split("T")[0],
                }
                setAffiliates((prev) => [newAffiliate, ...prev])
                setIsAddDialogOpen(false)
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  website: "",
                  socialMedia: "",
                  commissionRate: "",
                  paymentMethod: "",
                  bankAccount: "",
                  ifscCode: "",
                  panNumber: "",
                  address: "",
                  city: "",
                  state: "",
                  pincode: "",
                  marketingExperience: "",
                  targetAudience: "",
                  promotionStrategy: "",
                  status: "pending",
                })
              }}
            >
              Add Affiliate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
