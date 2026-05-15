import {
  componentResponseSchema,
  jsonError,
  jsonOk,
} from "@/lib/api";
import { getCatalogComponentById } from "@/lib/components";

type ComponentRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: ComponentRouteContext) {
  const { id } = await context.params;
  const component = await getCatalogComponentById(id);

  if (!component) {
    return jsonError({
      code: "component_not_found",
      message: `No component exists with ID "${id}".`,
      status: 404,
    });
  }

  return jsonOk(componentResponseSchema, {
    success: true,
    data: {
      component,
    },
  });
}
