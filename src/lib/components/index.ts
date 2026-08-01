export { getComponentColours } from "./colour";
export {
  getComponentById,
  groupComponentsByCategory,
  listComponents,
  listComponentsByCategory,
  searchComponents,
  validateBuildSelectionFromIds,
  type ComponentSearchCriteria,
  type ComponentsByCategory,
} from "./repository";
export {
  fetchSupabaseCatalogComponents,
  getCatalogComponentById,
  getCatalogComponents,
  groupCatalogComponentsByCategory,
  listCatalogComponents,
  listCatalogComponentsByCategory,
  loadCatalogComponents,
  mapSupabaseKeyboardComponentRow,
  searchCatalogComponents,
  validateCatalogBuildSelectionFromIds,
  type CatalogFallbackReason,
  type CatalogLoadResult,
  type CatalogSource,
  type SupabaseCatalogClient,
} from "./catalog-source";
