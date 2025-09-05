import { Hero } from "../components/Hero";
import { PrivacyEngine } from "../components/PrivacyEngine";
import { Usage } from "../components/Usage";
import { Pricing } from "../components/Pricing";
import { CTA } from "../components/CTA";
import { TalentForm } from "../components/TalentForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <PrivacyEngine />
      <Usage />
      <Pricing />
      <CTA />
      <TalentForm />
    </main>
  );
}
