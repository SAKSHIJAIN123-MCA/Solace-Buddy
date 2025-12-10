"use client";
import Link from "next/link";
import type React from "react";

import { useState, useEffect } from "react";

interface ICity {
  _id: string;
  name: string;
  state: {
    _id: string;
    name: string;
    country: {
      _id: string;
      name: string;
      code: string;
    };
  };
}

interface IArea {
  _id: string;
  name: string;
  city: {
    _id: string;
    name: string;
  };
}

export default function ConfusedToSelect() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    gender: "",
    neededFrom: "",
    city: "",
    areas: [],
    otherRequirements: "",
    // Specific Requirements
    acPreference: "",
    sharingPreference: [],
    budget: "",
    // Visit Scheduling
    preferredVisitDate: "",
  });

  const [showSpecificRequirements, setShowSpecificRequirements] =
    useState(false);
  const [showVisitScheduling, setShowVisitScheduling] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showSharingDropdown, setShowSharingDropdown] = useState(false);

  const [cities, setCities] = useState<ICity[]>([]);
  const [areas, setAreas] = useState<IArea[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<IArea[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const sharingOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (formData.city) {
      const selectedCity = cities.find((city) => city.name === formData.city);
      if (selectedCity) {
        fetchAreasByCity(selectedCity._id);
      }
    } else {
      setFilteredAreas([]);
      setFormData((prev) => ({ ...prev, areas: [] }));
    }
  }, [formData.city, cities]);

  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const response = await fetch("/api/locations/cities");
      const result = await response.json();
      if (result.success) {
        setCities(result.data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchAreasByCity = async (cityId: string) => {
    try {
      setLoadingAreas(true);
      const response = await fetch(`/api/locations/areas`);
      const result = await response.json();
      if (result.success) {
        setFilteredAreas(result.data);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      setLoadingAreas(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Mobile validation
    if (field === "mobile") {
      if (!/^\d{10}$/.test(value) && value !== "") {
        setMobileError("Mobile number must be exactly 10 digits");
      } else {
        setMobileError("");
      }
    }
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(
            (item: string) => item !== value
          )
        : [...(prev[field as keyof typeof prev] as string[]), value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileError || !formData.mobile.match(/^\d{10}$/)) {
      setMobileError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert("Inquiry submitted successfully!");
        // Reset form
        setFormData({
          name: "",
          mobile: "",
          email: "",
          gender: "",
          neededFrom: "",
          city: "",
          areas: [],
          otherRequirements: "",
          acPreference: "",
          sharingPreference: [],
          budget: "",
          preferredVisitDate: "",
        });
        setShowSpecificRequirements(false);
        setShowVisitScheduling(false);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Please try again."}`);
      }
    } catch (error) {
      alert("Error submitting inquiry. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2e057f] mb-12 text-center">
          Confused to Select?
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Expert Advice Card */}
          <div className="bg-gradient-to-br from-[#2e057f] to-[#4c1d95] rounded-2xl p-8 pt-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold mb-4">
                Get Expert Advice from SolaceBuddy
              </h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                Our experienced team understands the unique needs of students
                and working professionals. Get personalized recommendations
                based on your preferences, budget, and location requirements.
                From affordable stays to premium options, we ensure you find a
                perfect match without the hassle. Our guidance saves you time,
                effort, and unnecessary stress.
              </p>
              <Link href={"/contact"}>
                <button className="bg-white text-[#2e057f] px-6 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-4">
                  Talk to Expert
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#2e057f]/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#2e057f]"
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
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Standard Inquiry Form
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Fill out our quick form and we'll match you with the perfect
              accommodation options based on your specific needs.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Name, Mobile, Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                  <input
                    type="text"
                    value={formData.name}
                    placeholder="your name"
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-[#2e057f] focus:border-transparent 
                 outline-none transition-all duration-200"
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                  <input
                    type="tel"
                    value={formData.mobile}
                     placeholder="mobile number"
                    onChange={(e) =>
                      handleInputChange(
                        "mobile",
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    required
                    className={`mt-1 w-full px-4 py-3 border rounded-lg 
                 focus:ring-2 focus:ring-[#2e057f] focus:border-transparent 
                 outline-none transition-all duration-200 ${
                   mobileError ? "border-red-500" : "border-gray-300"
                 }`}
                  />
                  {mobileError && (
                    <p className="text-red-500 text-sm mt-1">{mobileError}</p>
                  )}
                </label>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                  <input
                    type="email"
                    value={formData.email}
                     placeholder="email"
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-[#2e057f] focus:border-transparent 
                 outline-none transition-all duration-200"
                  />
                </label>
              </div>

              {/* Row 2: Gender, Needed From Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    required
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-[#2e057f] focus:border-transparent 
                 outline-none transition-all duration-200"
                  >
                    <option value="">Select Gender *</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Needed From Date *
                  <input
                    type="date"
                    value={formData.neededFrom}
                    onChange={(e) =>
                      handleInputChange("neededFrom", e.target.value)
                    }
                    required
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-[#2e057f] focus:border-transparent 
                 outline-none transition-all duration-200"
                  />
                </label>
              </div>

              {/* Row 3: City, Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                    disabled={loadingCities}
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-[#2e057f] focus:border-transparent 
                 outline-none transition-all duration-200"
                  >
                    <option value="">
                      {loadingCities ? "Loading cities..." : "Select City *"}
                    </option>
                    {cities.map((city) => (
                      <option key={city._id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Areas *
                  <div className="relative mt-1">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleMultiSelect("areas", e.target.value);
                          e.target.value = "";
                        }
                      }}
                      disabled={!formData.city || loadingAreas}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-[#2e057f] focus:border-transparent 
                   outline-none transition-all duration-200"
                    >
                      <option value="">
                        {!formData.city
                          ? "Select city first"
                          : loadingAreas
                          ? "Loading areas..."
                          : "Select Areas *"}
                      </option>
                      {filteredAreas.map((area) => (
                        <option key={area._id} value={area.name}>
                          {area.name}
                        </option>
                      ))}
                    </select>

                    {formData.areas.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {formData.areas.map((area) => (
                          <span
                            key={area}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#2e057f] text-white text-sm rounded"
                          >
                            {area}
                            <button
                              type="button"
                              onClick={() => handleMultiSelect("areas", area)}
                              className="text-white hover:text-gray-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Other Requirements */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any Other Requirements
                <textarea
                  value={formData.otherRequirements}
                   placeholder="any other requirements"
                  onChange={(e) =>
                    handleInputChange("otherRequirements", e.target.value)
                  }
                  rows={3}
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg 
               focus:ring-2 focus:ring-[#2e057f] focus:border-transparent 
               outline-none transition-all duration-200"
                />
              </label>

              {/* Expandable Specific Requirements */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() =>
                    setShowSpecificRequirements(!showSpecificRequirements)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-700">
                    Specific Requirements
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      showSpecificRequirements ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showSpecificRequirements && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <select
                        value={formData.acPreference}
                        onChange={(e) =>
                          handleInputChange("acPreference", e.target.value)
                        }
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none"
                      >
                        <option value="">AC Preference</option>
                        <option value="AC">AC</option>
                        <option value="Non-AC">Non-AC</option>
                      </select>

                      <div className="relative">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleMultiSelect(
                                "sharingPreference",
                                e.target.value
                              );
                              e.target.value = "";
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none"
                        >
                          <option value="">Sharing Preference</option>
                          {sharingOptions.map((option) => (
                            <option key={option} value={option}>
                              {option} Person{option !== "1" ? "s" : ""}
                            </option>
                          ))}
                        </select>
                        {formData.sharingPreference.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {formData.sharingPreference.map((pref) => (
                              <span
                                key={pref}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-[#2e057f] text-white text-sm rounded"
                              >
                                {pref} Person{pref !== "1" ? "s" : ""}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMultiSelect("sharingPreference", pref)
                                  }
                                  className="text-white hover:text-gray-200"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <input
                        type="number"
                        placeholder="Budget"
                        value={formData.budget}
                        onChange={(e) =>
                          handleInputChange("budget", e.target.value)
                        }
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Expandable Visit Scheduling */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowVisitScheduling(!showVisitScheduling)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-700">
                    Schedule a Visit
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      showVisitScheduling ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showVisitScheduling && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Visit Date
                        </label>
                        <input
                          type="date"
                          value={formData.preferredVisitDate}
                          onChange={(e) =>
                            handleInputChange(
                              "preferredVisitDate",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2e057f] hover:bg-[#2e057f]/90 text-white py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
