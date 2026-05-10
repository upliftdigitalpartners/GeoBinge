import { SmartSearchForm } from "@/components/SmartSearchForm";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Smart search — GeoBinge",
  description:
    "Describe in plain English what you want to watch. AI translates it into a Netflix country search.",
};

export default function SmartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
          <Sparkles className="h-3 w-3" />
          AI-powered · Llama 3.3 on Groq
        </div>
        <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Just say what you want.
        </h1>
        <p className="mt-3 text-balance text-foreground-muted">
          Describe a vibe, era, country, mood, anything. The AI figures out
          which Netflix region to search in and what filters to apply.
        </p>
      </div>

      <SmartSearchForm />
    </div>
  );
}
