"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Search, LucideBookOpenText, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Orders: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 17h6"></path>
      <path d="M9 13h6"></path>
      <path d="M9 9h6"></path>
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2Z"></path>
    </svg>
  ),
  Returns: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 14 4 9l5-5"></path>
      <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path>
    </svg>
  ),
  Sizing: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2v4"></path>
      <path d="M10 2v4"></path>
      <path d="M18 2v4"></path>
      <path d="M6 14v4"></path>
      <path d="M10 14v4"></path>
      <path d="M18 14v4"></path>
      <path d="M2 6h20"></path>
      <path d="M2 10h20"></path>
      <path d="M2 14h20"></path>
      <path d="M2 18h20"></path>
    </svg>
  ),
  Shipping: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 10h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"></path>
      <path d="M10 10V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
      <path d="M8 16h.01"></path>
      <path d="M16 16h.01"></path>
    </svg>
  ),
  Products: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
    </svg>
  ),
  Payment: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
      <line x1="2" x2="22" y1="10" y2="10"></line>
    </svg>
  ),
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  useEffect(() => {
    // Fetch FAQs from the API
    const fetchFaqs = async () => {
      try {
        const response = await fetch("/api/faqs");
        if (response.ok) {
          const data = await response.json();
          setFaqs(data);
          setFilteredFaqs(data);
        } else {
          console.error("Failed to fetch FAQs");
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFaqs(
        activeCategory
          ? faqs.filter((faq) => faq.category === activeCategory)
          : faqs
      );
    } else {
      const query = searchQuery.toLowerCase();
      const results = faqs.filter(
        (faq) =>
          (activeCategory ? faq.category === activeCategory : true) &&
          (faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query))
      );
      setFilteredFaqs(results);
    }
  }, [searchQuery, activeCategory, faqs]);

  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e057f]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-neutral-50 to-neutral-100 min-h-screen py-0 text-black">
      {/* Full-Width Banner Outside Container */}
      <div className="relative h-[20vh] md:h-[30vh] overflow-hidden">
        <div className="absolute inset-0  bg-gradient-to-br from-[#2e057f] via-[#4c1d95] to-[#6b21a8] flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              className="max-w-2xl text-white"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">FAQs</h1>
              <p className="text-lg md:text-xl opacity-90 ml-2">
                Find answers to the most common questions about our products and
                services.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-9xl mx-auto px-4">
          {/* Search */}
          <div className="relative mb-8 max-w-md mx-auto py-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2e057f] focus:border-transparent"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-10">
            <button
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 ${
                activeCategory === null
                  ? "bg-[#2e057f] text-white shadow-md transform scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow"
              }`}
              onClick={() => setActiveCategory(null)}
            >
              <MessageSquare className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">All</span>
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-[#2e057f] text-white shadow-md transform scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow"
                }`}
                onClick={() => toggleCategory(category)}
              >
                <div className="mb-2">
                  {categoryIcons[category] || (
                    <MessageSquare className="h-6 w-6" />
                  )}
                </div>
                <span className="text-sm font-medium">{category}</span>
              </button>
            ))}
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-10">
                <LucideBookOpenText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No questions found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or category filter
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <button
                    className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                    onClick={() => toggleItem(faq._id)}
                    aria-expanded={openItems[faq._id]}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 text-[#2e057f]">
                        {categoryIcons[faq.category] || (
                          <LucideBookOpenText className="h-5 w-5" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {faq.question}
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-gray-500">
                      {openItems[faq._id] ? (
                        <ChevronUp className="h-5 w-5 transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {openItems[faq._id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-gray-600 border-t border-gray-100 bg-gray-50">
                          <p>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>

          {/* Contact section */}
          <motion.div
            className="mt-12 mb-10 bg-gradient-to-r from-[#2e057f] to-[#2e057f] p-10 rounded-lg shadow-md text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-medium mb-4">Still have questions?</h2>
            <p className="text-blue-100 mb-6 max-w-lg mx-auto">
              If you couldn't find the answer to your question, our customer
              support team is ready to help you with any inquiries.
            </p>
            <Link href="/contact">
              <button className="bg-white text-[#2e057f] hover:bg-[#2e057f] px-8 py-3 rounded-md font-medium transition-colors duration-200 shadow-sm">
                Contact Us
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
