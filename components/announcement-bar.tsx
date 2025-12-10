export function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-gray-200 py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-xs text-gray-700 font-medium">Contact Support: +91 9662347192</div>

        <div className="flex items-center gap-4">
          <a href="/areas" className="text-xs font-medium text-[#2e057f] hover:underline transition-all duration-200">
            Select Areas
          </a>
          <a href="/properties" className="text-xs font-medium text-[#2e057f] hover:underline transition-all duration-200">
           Book Properties
          </a>
          <a href="/vendor-central" className="text-xs font-medium text-[#2e057f] hover:underline transition-all duration-200">
            Vendor Center
          </a>
        </div>
      </div>
    </div>
  )
}
