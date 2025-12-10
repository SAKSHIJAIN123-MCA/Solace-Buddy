import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  const benefits = [
    "No Registration Fee",
    "No Advertising Cost",
    "No Listing Charges",
    "Pay Only When a Tenant Moves In",
  ];

  return (
    <section className="border-b border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-96">
        {/* Left Column */}
        <div className="bg-white p-8 md:p-16 border-r border-border flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            You Drive Expansion,
          </h1>
          <p className="text-xl md:text-2xl font-semibold italic text-foreground/80 mb-8">
            We'll Ensure Maximum Occupancy
          </p>

          <h2 className="text-2xl font-bold mb-6">Now fill your PG Beds_</h2>

          <div className="space-y-3 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index === 3 ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {index === 3 && <Check className="w-3 h-3 text-white" />}
                  {index < 3 && <span className="text-white text-xs">✕</span>}
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          <p className="text-sm font-medium">Contact us today to know more</p>
        </div>

        {/* Right Column */}
        <div className="bg-gray-100 p-8 md:p-12 flex flex-col justify-center items-center text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-8">
            Kick start Your PG Success Today
          </h3>

          <div className="w-full max-w-xs space-y-4">
            <Link href="/vendor/register" passHref>
              <Button className="w-full bg-[#2e057f] hover:bg-blue-700 text-white font-semibold py-3 text-base">
                Register Your PG Now
              </Button>
            </Link>

            <div className="text-foreground/60 font-medium">or</div>
            <Link href="/vendor/login" passHref>
              <Button
                variant="outline"
                className="w-full bg-[#2e057f] hover:bg-blue-700 text-white font-semibold py-3 text-base border-0"
              >
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
