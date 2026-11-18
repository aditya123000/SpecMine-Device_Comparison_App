import test from "node:test";
import assert from "node:assert/strict";
import { buildDeviceBrandsQuery, buildDeviceCatalogQuery, sanitizeDeviceFilters } from "../repositories/deviceQuery.js";

test("sanitizeDeviceFilters applies defaults and a maximum page size", () => {
  assert.deepEqual(sanitizeDeviceFilters({ limit: "999", q: "  Pixel  " }), {
    page: 1,
    limit: 100,
    search: "Pixel",
    category: "",
    brand: "",
    availability: "all",
    maxPrice: null,
    minRam: null,
    sort: "relevance",
  });
});

test("sanitizeDeviceFilters rejects invalid pagination, filter, and sort values", () => {
  assert.throws(() => sanitizeDeviceFilters({ page: "0" }), /positive integers/);
  assert.throws(() => sanitizeDeviceFilters({ maxPrice: "-1" }), /non-negative number/);
  assert.throws(() => sanitizeDeviceFilters({ sort: "brand desc; DROP TABLE devices" }), /Unsupported sort/);
});

test("sanitizeDeviceFilters caps the database offset based on page size", () => {
  const filters = sanitizeDeviceFilters({ page: "999999", limit: "100" });
  assert.equal(filters.page, 1001);
  assert.equal((filters.page - 1) * filters.limit, 100_000);
});

test("buildDeviceCatalogQuery parameterizes catalog filters", () => {
  const query = buildDeviceCatalogQuery(sanitizeDeviceFilters({
    q: "Galaxy",
    category: "phone",
    brand: "Samsung",
    page: "2",
    limit: "20",
  }));

  assert.match(query.dataSql, /brand ILIKE \$1/);
  assert.match(query.dataSql, /COALESCE\(category, payload->>'category'\) ILIKE ANY\(\$2::text\[\]\)/);
  assert.match(query.dataSql, /LIMIT \$4 OFFSET \$5/);
  assert.deepEqual(query.params, ["%Galaxy%", ["phones", "phone", "smartphone", "smartphones", "mobile", "mobiles", "cellphone"], "Samsung", 20, 20]);
  assert.deepEqual(query.filterParams, ["%Galaxy%", ["phones", "phone", "smartphone", "smartphones", "mobile", "mobiles", "cellphone"], "Samsung"]);
});

test("buildDeviceCatalogQuery parameterizes specification filters and uses a fixed sort allowlist", () => {
  const filters = sanitizeDeviceFilters({ category: "phones", availability: "available", maxPrice: "80000", minRam: "8", sort: "price_asc" });
  const query = buildDeviceCatalogQuery(filters);
  assert.match(query.dataSql, /price ASC NULLS LAST/);
  assert.match(query.dataSql, /available, LOWER\(payload->>'available'\)/);
  assert.match(query.dataSql, /substring\(UPPER\(COALESCE\(ram, payload->>'ram'\)\)/);
  assert.deepEqual(query.params.slice(-4), [true, 8, 24, 0]);
});

test("buildDeviceBrandsQuery includes uncategorized phone records", () => {
  const query = buildDeviceBrandsQuery("phones");
  assert.match(query.sql, /COALESCE\(category, payload->>'category'\) IS NULL/);
  assert.deepEqual(query.params, [["phones", "phone", "smartphone", "smartphones", "mobile", "mobiles", "cellphone"]]);
});
