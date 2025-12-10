"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

interface Inquiry {
  id: string
  name: string
  mobile: string
  email: string
  gender: string
  neededFrom: string
  city: string
  areas: string[]
  otherRequirements: string
  acPreference: string
  sharingPreference: string[]
  budgetMin: string
  budgetMax: string
  preferredVisitDate: string
  decidedPropertyVisitDate: string
  submittedAt: string
}

export default function AdminDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const response = await fetch("/api/inquiries")
      const data = await response.json()
      setInquiries(data) // Removed reverse() since MongoDB query already sorts by newest first
    } catch (error) {
      console.error("Error fetching inquiries:", error)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString("en-IN")
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e057f] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2e057f]">Standard Inquiries</h1>
              <p className="text-gray-600 mt-2">Manage accommodation inquiries</p>
            </div>
           
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Inquiries ({inquiries.length})</h2>
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500">No inquiries yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Needed From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{inquiry.name || "Not provided"}</div>
                          <div className="text-sm text-gray-500">{inquiry.gender || "Not specified"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{inquiry.mobile || "Not provided"}</div>
                        <div className="text-sm text-gray-500">{inquiry.email || "Not provided"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{inquiry.city || "Not specified"}</div>
                        <div className="text-sm text-gray-500">
                          {inquiry.areas.length > 0 ? inquiry.areas.join(", ") : "No areas specified"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(inquiry.neededFrom)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(inquiry.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedInquiry(inquiry)}
                          className="text-[#2e057f] hover:text-[#2e057f]/80 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Inquiry Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Inquiry Details</h3>
              <button onClick={() => setSelectedInquiry(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{selectedInquiry.name || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="text-sm text-gray-900">{selectedInquiry.gender || "Not specified"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <p className="text-sm text-gray-900">{selectedInquiry.mobile || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedInquiry.email || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <p className="text-sm text-gray-900">{selectedInquiry.city || "Not specified"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Needed From</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedInquiry.neededFrom)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Areas</label>
                <p className="text-sm text-gray-900">
                  {selectedInquiry.areas.length > 0 ? selectedInquiry.areas.join(", ") : "No areas specified"}
                </p>
              </div>

              {selectedInquiry.otherRequirements && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Other Requirements</label>
                  <p className="text-sm text-gray-900">{selectedInquiry.otherRequirements}</p>
                </div>
              )}

              {(selectedInquiry.acPreference ||
                selectedInquiry.sharingPreference.length > 0 ||
                selectedInquiry.budgetMin ||
                selectedInquiry.budgetMax) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Specific Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedInquiry.acPreference && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">AC Preference</label>
                        <p className="text-sm text-gray-900">{selectedInquiry.acPreference}</p>
                      </div>
                    )}
                    {selectedInquiry.sharingPreference.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sharing Preference</label>
                        <p className="text-sm text-gray-900">
                          {selectedInquiry.sharingPreference.join(", ")} person(s)
                        </p>
                      </div>
                    )}
                    {(selectedInquiry.budgetMin || selectedInquiry.budgetMax) && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Budget Range</label>
                        <p className="text-sm text-gray-900">
                          ₹{selectedInquiry.budgetMin || "0"} - ₹{selectedInquiry.budgetMax || "No limit"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedInquiry.preferredVisitDate || selectedInquiry.decidedPropertyVisitDate) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Visit Scheduling</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedInquiry.preferredVisitDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Preferred Visit Date</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedInquiry.preferredVisitDate)}</p>
                      </div>
                    )}
                    {selectedInquiry.decidedPropertyVisitDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Decided Property Visit Date</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedInquiry.decidedPropertyVisitDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700">Submitted At</label>
                <p className="text-sm text-gray-900">{formatDateTime(selectedInquiry.submittedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
