const MAX_PAGE_SIZE = 100;
const MAX_PAGE_OFFSET = 100_000;

const CATEGORY_FILTERS = {
  phones: ["phones", "phone", "smartphone", "smartphones", "mobile", "mobiles", "cellphone"],
  laptops: ["laptops", "laptop", "notebook", "ultrabook"],
  tablets: ["tablets", "tablet", "tab", "ipad"],
  earbuds: ["earbuds", "earbud", "buds", "tws"],
  headphones: ["headphones", "headphone", "headset"],
  tvs: ["tvs", "tv", "television", "smarttv", "smart-tv"],
};

const SORT_EXPRESSIONS = {
  relevance: "brand ASC, model ASC, id ASC",
  price_asc: "price ASC NULLS LAST, brand ASC, model ASC, id ASC",
  price_desc: "price DESC NULLS LAST, brand ASC, model ASC, id ASC",
  ram_desc: "substring(UPPER(COALESCE(ram, payload->>'ram')) from '([0-9]+)[[:space:]]*GB')::numeric DESC NULLS LAST, brand ASC, model ASC, id ASC",
  year_desc: "substring(COALESCE(\"launchedYear\", payload->>'launchedYear') from '[0-9]{4}')::int DESC NULLS LAST, brand ASC, model ASC, id ASC",
};

const invalidQuery = (message) => {
  const error = new Error(message);
  error.status = 400;
  error.code = "VALIDATION_ERROR";
  throw error;
};

const parsePositiveInt = (value, fallback, maximum) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (!/^\d+$/.test(String(value))) invalidQuery("Pagination values must be positive integers");
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) invalidQuery("Pagination values must be positive integers");
  return Math.min(parsed, maximum);
};

const parseOptionalNumber = (value, label) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) invalidQuery(`${label} must be a non-negative number`);
  return parsed;
};

const getCategoryFilterValues = (category) => {
  const normalized = String(category ?? "").toLowerCase().replace(/[\s_-]+/g, "").trim();
  const matched = Object.entries(CATEGORY_FILTERS).find(([key, values]) =>
    key === normalized || values.some((value) => value.replace(/[\s_-]+/g, "") === normalized)
  );
  return matched ? matched[1] : [String(category).trim()];
};

const sanitizeDeviceFilters = (query = {}) => {
  const availability = String(query.availability ?? "all").trim().toLowerCase();
  if (!["all", "available", "unavailable"].includes(availability)) {
    invalidQuery("Availability must be all, available, or unavailable");
  }
  const sort = String(query.sort ?? "relevance").trim().toLowerCase();
  if (!Object.hasOwn(SORT_EXPRESSIONS, sort)) invalidQuery("Unsupported sort order");

  const limit = parsePositiveInt(query.limit, 24, MAX_PAGE_SIZE);

  return {
    page: parsePositiveInt(query.page, 1, Math.floor(MAX_PAGE_OFFSET / limit) + 1),
    limit,
    search: String(query.q ?? "").trim().slice(0, 100),
    category: String(query.category ?? "").trim().slice(0, 60),
    brand: String(query.brand ?? "").trim().slice(0, 60),
    availability,
    maxPrice: parseOptionalNumber(query.maxPrice, "Maximum price"),
    minRam: parseOptionalNumber(query.minRam, "Minimum RAM"),
    sort,
  };
};

const buildDeviceCatalogQuery = (filters) => {
  const conditions = [];
  const params = [];
  const add = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (filters.search) {
    const value = add(`%${filters.search}%`);
    conditions.push(`(brand ILIKE ${value} OR model ILIKE ${value})`);
  }
  if (filters.category) {
    const categories = add(getCategoryFilterValues(filters.category));
    const categoryColumn = "COALESCE(category, payload->>'category')";
    const missingIsPhone = getCategoryFilterValues(filters.category) === CATEGORY_FILTERS.phones;
    conditions.push(missingIsPhone
      ? `(${categoryColumn} ILIKE ANY(${categories}::text[]) OR (${categoryColumn} IS NULL OR BTRIM(${categoryColumn}) = ''))`
      : `${categoryColumn} ILIKE ANY(${categories}::text[])`);
  }
  if (filters.brand) conditions.push(`brand ILIKE ${add(filters.brand)}`);
  if (filters.maxPrice !== null) conditions.push(`price <= ${add(filters.maxPrice)}`);
  if (filters.availability !== "all") {
    const value = filters.availability === "available";
    conditions.push(`COALESCE(available, LOWER(payload->>'available') = 'true') = ${add(value)}`);
  }
  if (filters.minRam !== null) {
    const minimum = add(filters.minRam);
    conditions.push(`substring(UPPER(COALESCE(ram, payload->>'ram')) from '([0-9]+)[[:space:]]*GB')::numeric >= ${minimum}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countSql = `SELECT COUNT(*)::int AS count FROM devices ${where}`;
  const limit = add(filters.limit);
  const offset = add((filters.page - 1) * filters.limit);
  const dataSql = `
    SELECT * FROM devices ${where}
    ORDER BY ${SORT_EXPRESSIONS[filters.sort]}
    LIMIT ${limit} OFFSET ${offset}`;

  return { countSql, dataSql, params, filterParams: params.slice(0, -2) };
};

const buildDeviceBrandsQuery = (category = "") => {
  if (!category) {
    return { sql: "SELECT DISTINCT brand FROM devices WHERE BTRIM(brand) <> '' ORDER BY brand ASC", params: [] };
  }
  const categories = getCategoryFilterValues(category);
  const categoryColumn = "COALESCE(category, payload->>'category')";
  const missingIsPhone = categories === CATEGORY_FILTERS.phones;
  const categoryCondition = missingIsPhone
    ? `(${categoryColumn} ILIKE ANY($1::text[]) OR (${categoryColumn} IS NULL OR BTRIM(${categoryColumn}) = ''))`
    : `${categoryColumn} ILIKE ANY($1::text[])`;
  return {
    sql: `SELECT DISTINCT brand FROM devices WHERE BTRIM(brand) <> '' AND ${categoryCondition} ORDER BY brand ASC`,
    params: [categories],
  };
};

export {
  MAX_PAGE_SIZE,
  MAX_PAGE_OFFSET,
  buildDeviceBrandsQuery,
  buildDeviceCatalogQuery,
  getCategoryFilterValues,
  sanitizeDeviceFilters,
};
