import { Hero } from "../components/Hero";
import { PrivacyEngine } from "../components/PrivacyEngine";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <PrivacyEngine />
    </main>
  );
}
