"use client";
import { Check } from "lucide-react";

export function TechSection() {
  return (
    <section aria-labelledby="tech" className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid items-stretch gap-10 md:grid-cols-2">
          <div className="space-y-5 self-center">
            <h2
              id="tech"
              className="text-pretty text-3xl font-bold md:text-3xl"
            >
              Living Experience Enhanced by{" "}
              <span className="text-[#2e057f]">Technology</span>
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Explore curated homes, book tours, move in, and manage essentials
              from one place. We streamline each step so you can enjoy a
              hassle‑free stay. Technology is integrated into every phase of
              your rental process, ensuring a truly elevated living experience.
              From exploring curated homes that match your lifestyle and
              filtering them by metro line, to shortlisting with virtual tours
              and booking beds, our tech-driven approach simplifies it all.
              After moving into any GetSetHome property, you get to experience
              community living, complimentary maintenance and service requests*,
              consolidated billing, efficient query resolutions and much more
              driven by our robust technology. So, you can enjoy a hassle free
              stay at every step of the way.
            </p>

            <div className="grid gap-4 md:grid-cols-2 pt-4">
              <Benefit
                title="Find lifestyle‑fit"
                body="Browse collections that match your routine. Book tours or explore virtually."
              />
              <Benefit
                title="All in one place"
                body="Pay rent with a single invoice, raise tickets, and connect with your community."
              />
            </div>
          </div>

          <div className="relative w-full self-stretch">
            <figure className="h-64 w-full overflow-hidden rounded-xl md:h-full">
              <img
                src="/Artboard 2.png"
                alt="Friends laughing together in a bright living room"
                className="h-full w-full object-cover"
                loading="lazy"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefit({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-2 flex items-center gap-2">
        <Check className="size-4 text-green-600" />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-base leading-relaxed text-muted-foreground">{body}</p>
      
    </div>
    
  );
}
