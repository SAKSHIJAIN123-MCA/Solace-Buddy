"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";

export default function PackagesSection() {
  const packages = ["Silver", "Gold", "Platinum", "Diamond"];

  const features = [
    {
      name: "Free Listing on SolaceBuddy",
      values: [true, true, true, true],
    },
    {
      name: "Free Advertising",
      values: [true, true, true, true],
    },
    {
      name: "Solace Verified Badge",
      values: [false, true, true, true],
    },
    {
      name: "Top 5 Searches",
      values: [false, false, true, true],
    },
    {
      name: "Banner on Homepage",
      values: [false, false, false, true],
    },
  ];

  const charges = [
    "25% of Rent / ₹2500 (whichever higher)",
    "50% of Rent / ₹5000 (whichever higher)",
    "75% of Rent / ₹7500 (whichever higher)",
    "100% of Rent / ₹10000 (whichever higher)",
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Charges on Successful Booking
          </h2>
          <p className="text-lg text-gray-600">
            Choose the perfect package to maximize your PG visibility
          </p>
        </div>

        {/* Pricing Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-gray-900 text-white rounded-lg overflow-hidden">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Features
                </th>
                {packages.map((pkg) => (
                  <th
                    key={pkg}
                    className="px-6 py-4 text-center font-semibold text-gray-300"
                  >
                    {pkg}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-800 hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-200">{feature.name}</td>
                  {feature.values.map((value, i) => (
                    <td key={i} className="px-6 py-4 text-center">
                      {value ? (
                        <Check className="w-5 h-5 text-green-500 inline" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 inline" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Charges Row */}
              <tr className="bg-gray-800 font-semibold text-gray-100">
                <td className="px-6 py-4">Charges</td>
                {charges.map((charge, i) => (
                  <td key={i} className="px-6 py-4 text-center">
                    {charge}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-10">
          <Link href="/vendor/register" passHref>
            <button className="bg-[#2e057f] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition">
             Start Now - It's Free
            </button>
          </Link>

          <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Trusted by 500+ PG Owners</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>No Advance Charges</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Grow Exponentially</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
