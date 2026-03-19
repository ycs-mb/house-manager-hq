import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import AgentCards from "@/components/landing/AgentCards";
import HowItWorks from "@/components/landing/HowItWorks";
import WeeklySchedule from "@/components/landing/WeeklySchedule";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Problem />
      <AgentCards />
      <HowItWorks />
      <WeeklySchedule />
      <Footer />
    </main>
  );
}
