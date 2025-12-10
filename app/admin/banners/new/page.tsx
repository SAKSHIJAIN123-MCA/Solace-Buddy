import { BannerForm } from "@/components/admin/banner-form"

export default function NewBannerPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Banner</h1>
        <p className="text-gray-600">Add a new hero banner to your website</p>
      </div>

      <BannerForm />
    </div>
  )
}
