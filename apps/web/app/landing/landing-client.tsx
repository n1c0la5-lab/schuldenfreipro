"use client";

import { Hero } from "./hero";
import { FeaturesSection } from "./features-section";
import { ProblemSolutionSection } from "./problem-solution-section";
import { ValuesSection } from "./values-section";
import { WhatWeDo } from "./what-we-do";
import { TargetAudienceSection } from "./target-audience-section";
import { TeamSection } from "./team-section";
import { RoadmapSection } from "./roadmap-section";
import { CTASection } from "./cta-section";
import { Footer } from "./footer";

export function LandingClient() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <Hero />
      <FeaturesSection />
      <ProblemSolutionSection />
      <ValuesSection />
      <WhatWeDo />
      <TargetAudienceSection />
      <TeamSection />
      <RoadmapSection />
      <CTASection />
      <Footer />
    </main>
  );
}
