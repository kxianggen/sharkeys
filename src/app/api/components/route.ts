import type { NextRequest } from "next/server";

import {
  componentsListResponseSchema,
  componentsQuerySchema,
  isZodError,
  jsonOk,
  jsonZodError,
} from "@/lib/api";
import { searchCatalogComponents } from "@/lib/components";

export async function GET(request: NextRequest) {
  try {
    const criteria = componentsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const components = await searchCatalogComponents({
      category: criteria.category,
      query: criteria.q,
      layout: criteria.layout,
      switchTechnology: criteria.switchTechnology,
      soundProfile: criteria.soundProfile,
      beginnerFriendly: criteria.beginnerFriendly,
      maxPrice: criteria.maxPrice,
      currency: criteria.currency,
    });

    return jsonOk(componentsListResponseSchema, {
      success: true,
      data: {
        components,
        count: components.length,
      },
    });
  } catch (error) {
    if (isZodError(error)) {
      return jsonZodError(error, "Invalid component filters.");
    }

    throw error;
  }
}
