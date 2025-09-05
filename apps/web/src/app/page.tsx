import { Hero } from "../components/Hero";
import { PrivacyEngine } from "../components/PrivacyEngine";
import { Usage } from "../components/Usage";
import { UploadSteps } from "../components/UploadSteps";
import { Steps } from "../components/Steps";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <PrivacyEngine />
      <Usage />
      <UploadSteps />
      <Steps />
    </main>
  );
}
