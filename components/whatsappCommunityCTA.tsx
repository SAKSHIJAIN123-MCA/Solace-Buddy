import Link from "next/link";

export default function WhatsappCommunityCTA() {
  return (
    <div className="mt-16">
      <div className="bg-[#2e057f] rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Left Side - Text */}
        <div className="text-center md:text-left max-w-xl">
          <h3 className="text-2xl font-bold mb-4">
            Wants to Join SolaceBuddy Community for Updates?
          </h3>
          <p className="text-white/90 mb-2 text-xl">
            Subscribe to SolaceBuddy's official WhatsApp Channel to get updates
            on new PGs, offers, and related news.
          </p>
          <p className="text-white/90 text-xl">
            Don’t worry, we will not sending spam or bulk messages.
          </p>
        </div>

        {/* Right Side - Button */}
        <div className="flex justify-center md:justify-end w-full md:w-auto">
          <Link
            href="https://tinyurl.com/solacewhatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-white text-green-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200 shadow-md">
              Subscribe Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
