import { Hero } from "../components/Hero";
import { PrivacyEngine } from "../components/PrivacyEngine";
import { Usage } from "../components/Usage";
import { AssistantNotify } from "../components/AssistantNotify";
import { Addendum } from "../components/Addendum";
import { Pricing } from "../components/Pricing";
import { CTA } from "../components/CTA";
import { TalentForm } from "../components/TalentForm";
import { LandingTreeShowcase } from "../components/LandingTreeShowcase";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <PrivacyEngine />
      <Usage />
      <Addendum />
      <AssistantNotify />
      <LandingTreeShowcase />
      <Pricing />
      <CTA />
      <TalentForm />
    </main>
  );
}
