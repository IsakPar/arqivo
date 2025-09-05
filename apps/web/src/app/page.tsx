import { Hero } from "../components/Hero";
import { PrivacyEngine } from "../components/PrivacyEngine";
import { Usage } from "../components/Usage";
import { UploadDemo } from "../components/UploadDemo";
import { Steps } from "../components/Steps";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <PrivacyEngine />
      <Usage />
      <UploadDemo />
      <Steps />
    </main>
  );
}
