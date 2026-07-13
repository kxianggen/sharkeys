import { RecommendationDemo } from "@/components/recommendation-demo";
import { getSessionUser } from "@/lib/auth";

type ConfiguratorSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export default async function ConfiguratorPage({
  searchParams,
}: {
  searchParams?: ConfiguratorSearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const initialPrompt = getParamValue(params.prompt);
  const initialKitId = getParamValue(params.kit);
  const user = await getSessionUser();

  return (
    <RecommendationDemo
      initialKitId={initialKitId}
      initialPrompt={initialPrompt}
      isAuthenticated={Boolean(user)}
      mode="configurator"
    />
  );
}

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
