import { LandingViewedTracker } from "@/components/analytics-page-view";
import { RecommendationDemo } from "@/components/recommendation-demo";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <main className="min-h-screen bg-surface-secondary text-primary">
      <LandingViewedTracker />
      <RecommendationDemo isAuthenticated={Boolean(user)} />
    </main>
  );
}
