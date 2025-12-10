"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { HelpCircle, Plus, Edit, Check, X, Save } from "lucide-react"
import Link from "next/link"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface FAQItem {
  _id: string
  question: string
  answer: string
  category: string
}

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  // For adding/editing
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
  })
  const [newCategory, setNewCategory] = useState("")
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/faqs")
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
        const uniqueCategories = Array.from(new Set(data.map((faq: FAQItem) => faq.category)))
        setCategories(uniqueCategories as string[])
      } else {
        console.error("Failed to fetch FAQs")
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const startAdding = () => {
    setIsAdding(true)
    setIsEditing(null)
    setFormData({
      question: "",
      answer: "",
      category: categories.length > 0 ? categories[0] : "",
    })
  }

  const cancelAdding = () => {
    setIsAdding(false)
    setShowNewCategoryInput(false)
  }

  const startEditing = (faq: FAQItem) => {
    setIsEditing(faq._id)
    setIsAdding(false)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
    })
  }

  const cancelEditing = () => {
    setIsEditing(null)
  }

  const addNewCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()])
      setFormData((prev) => ({ ...prev, category: newCategory.trim() }))
      setNewCategory("")
      setShowNewCategoryInput(false)
    }
  }

  const saveFAQ = async () => {
    try {
      const response = await fetch("/api/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsAdding(false)
        fetchFaqs()
      } else {
        console.error("Failed to add FAQ")
      }
    } catch (error) {
      console.error("Error adding FAQ:", error)
    }
  }

  const updateFAQ = async () => {
    if (!isEditing) return

    try {
      const response = await fetch(`/api/faqs/${isEditing}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsEditing(null)
        fetchFaqs()
      } else {
        console.error("Failed to update FAQ")
      }
    } catch (error) {
      console.error("Error updating FAQ:", error)
    }
  }

  const deleteFAQ = async (id: string) => {
    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchFaqs()
      } else {
        console.error("Failed to delete FAQ")
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
            <p className="text-gray-600">Add, edit, or remove frequently asked questions</p>
          </div>
          <div className="flex gap-4">
            <Link href="/faq">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                View Public FAQ Page
              </button>
            </Link>
            <button
              onClick={startAdding}
              className="px-4 py-2 bg-[#2e057f] text-white rounded-md hover:bg-[#2e057f] flex items-center gap-2"
            >
              <Plus size={16} /> Add New FAQ
            </button>
          </div>
        </div>

        {/* Add form */}
        {isAdding && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200 ">
            <h2 className="text-lg font-semibold mb-4">Add New FAQ</h2>
            <div className="space-y-4">
              <div className="mb-4">
                <label htmlFor="question" className=" text-lg block font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter the question"
                />
              </div>
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  id="answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter the answer"
                ></textarea>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                {!showNewCategoryInput ? (
                  <div className="flex gap-2">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(true)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      New
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="New category name"
                    />
                    <button
                      type="button"
                      onClick={addNewCategory}
                      className="px-3 py-2 bg-[#2e057f] text-white rounded-md hover:bg-[#2e057f]"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(false)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cancelAdding}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveFAQ}
                  className="px-4 py-2 bg-[#2e057f] text-white rounded-md hover:bg-[#2e057f] flex items-center gap-2"
                >
                  <Save size={16} /> Save FAQ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Question
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Answer Preview
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faqs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg">No FAQs found</p>
                    <p className="text-sm">Start by adding your first FAQ item</p>
                  </td>
                </tr>
              ) : (
                faqs.map((faq) => (
                  <tr key={faq._id}>
                    {isEditing === faq._id ? (
                      <td colSpan={4} className="px-6 py-4">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="edit-question" className="block text-sm font-medium text-gray-700 mb-1">
                              Question
                            </label>
                            <input
                              type="text"
                              id="edit-question"
                              name="question"
                              value={formData.question}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-answer" className="block text-sm font-medium text-gray-700 mb-1">
                              Answer
                            </label>
                            <textarea
                              id="edit-answer"
                              name="answer"
                              value={formData.answer}
                              onChange={handleInputChange}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            ></textarea>
                          </div>
                          <div>
                            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                              Category
                            </label>
                            {!showNewCategoryInput ? (
                              <div className="flex gap-2">
                                <select
                                  id="edit-category"
                                  name="category"
                                  value={formData.category}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                  {categories.map((category) => (
                                    <option key={category} value={category}>
                                      {category}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setShowNewCategoryInput(true)}
                                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                >
                                  New
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newCategory}
                                  onChange={(e) => setNewCategory(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  placeholder="New category name"
                                />
                                <button
                                  type="button"
                                  onClick={addNewCategory}
                                  className="px-3 py-2 bg-[#2e057f] text-white rounded-md hover:bg-[#2e057f]"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowNewCategoryInput(false)}
                                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={updateFAQ}
                              className="px-4 py-2 bg-[#2e057f] text-white rounded-md hover:bg-[#2e057f] flex items-center gap-2"
                            >
                              <Save size={16} /> Update
                            </button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{faq.question}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-[#2e057f]">
                            {faq.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500 truncate max-w-xs">{faq.answer}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEditing(faq)}
                              className="text-[#2e057f] hover:text-[#2e057f] p-1"
                            >
                              <Edit size={16} />
                            </button>
                            <DeleteConfirmationDialog
                              title="Delete FAQ"
                              description="Are you sure you want to delete this FAQ? This action cannot be undone."
                              itemName={faq.question}
                              onConfirm={() => deleteFAQ(faq._id)}
                              buttonSize="icon"
                            />
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
