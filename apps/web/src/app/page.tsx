import { Hero } from "../components/Hero";
import { HeroRefinement } from "../components/HeroRefinement";
import { PrivacyEngine } from "../components/PrivacyEngine";
import { Usage } from "../components/Usage";
import { AssistantNotify } from "../components/AssistantNotify";
import { Pricing } from "../components/Pricing";
import { CTA } from "../components/CTA";
import { TalentForm } from "../components/TalentForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <HeroRefinement />
      <PrivacyEngine />
      <Usage />
      <AssistantNotify />
      <Pricing />
      <CTA />
      <TalentForm />
    </main>
  );
}
