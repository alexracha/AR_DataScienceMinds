import { About } from "@/components/sections/About";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { CostOfInaction } from "@/components/sections/CostOfInaction";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Nav } from "@/components/sections/Nav";
import { Problem } from "@/components/sections/Problem";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { SocialProof } from "@/components/sections/SocialProof";
import { Solution } from "@/components/sections/Solution";
import { Testimonials } from "@/components/sections/Testimonials";
import { StickyMobileCta } from "@/components/StickyMobileCta";
import { copy } from "@/lib/copy";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: copy.brand.name,
  description: copy.meta.description,
  serviceType: copy.services.items.map((s) => s.name),
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main>
        <Hero />
        <SocialProof />
        <Problem />
        <CostOfInaction />
        <Solution />
        <Services />
        <Process />
        <CaseStudies />
        <Testimonials />
        <About />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
