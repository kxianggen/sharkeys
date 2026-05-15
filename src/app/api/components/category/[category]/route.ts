import {
  categoryComponentsResponseSchema,
  isZodError,
  jsonOk,
  jsonZodError,
} from "@/lib/api";
import { listCatalogComponentsByCategory } from "@/lib/components";
import { componentCategorySchema } from "@/lib/types";

type ComponentCategoryRouteContext = {
  params: Promise<{
    category: string;
  }>;
};

export async function GET(
  _request: Request,
  context: ComponentCategoryRouteContext,
) {
  try {
    const { category: rawCategory } = await context.params;
    const category = componentCategorySchema.parse(rawCategory);
    const components = await listCatalogComponentsByCategory(category);

    return jsonOk(categoryComponentsResponseSchema, {
      success: true,
      data: {
        category,
        components,
        count: components.length,
      },
    });
  } catch (error) {
    if (isZodError(error)) {
      return jsonZodError(error, "Invalid component category.");
    }

    throw error;
  }
}
