import { RecommendationDemo } from "@/components/recommendation-demo";

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

  return <RecommendationDemo initialPrompt={initialPrompt} mode="configurator" />;
}

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
