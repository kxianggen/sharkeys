import { RecommendationDemo } from "@/components/recommendation-demo";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <main className="min-h-screen bg-surface-secondary text-primary">
      <RecommendationDemo isAuthenticated={Boolean(user)} />
    </main>
  );
}
