import { query } from "../config/db.js";
import { normalizeDevice } from "../utils/normalizeDevice.js";
import { buildDeviceBrandsQuery, buildDeviceCatalogQuery } from "./deviceQuery.js";

const buildDeviceFromRow = (row) => {
  const { payload, ...rowFields } = row;

  if (payload && typeof payload === "object") {
    return normalizeDevice({
      ...rowFields,
      ...payload,
    });
  }

  return normalizeDevice(rowFields);
};

const getAllDevices = async (limit) => {
  const params = [];
  let sql = `
    SELECT *
    FROM devices
    ORDER BY
      CASE WHEN id ~ '^[0-9]+$' THEN id::int END NULLS LAST,
      id
  `;

  if (Number.isInteger(limit) && limit > 0) {
    params.push(limit);
    sql += " LIMIT $1";
  }

  const { rows } = await query(sql, params);
  return rows.map(buildDeviceFromRow).filter((device) => device !== null);
};

const getDeviceCatalog = async (filters) => {
  const { countSql, dataSql, params, filterParams } = buildDeviceCatalogQuery(filters);
  const [countResult, dataResult] = await Promise.all([
    query(countSql, filterParams),
    query(dataSql, params),
  ]);

  return {
    devices: dataResult.rows.map(buildDeviceFromRow).filter((device) => device !== null),
    total: countResult.rows[0]?.count ?? 0,
  };
};

const getDeviceBrands = async (category = "") => {
  const { sql, params } = buildDeviceBrandsQuery(category);
  const { rows } = await query(sql, params);
  return rows.map((row) => row.brand);
};

const getDeviceById = async (id) => {
  const { rows } = await query(
    "SELECT * FROM devices WHERE id = $1",
    [String(id)]
  );
  return rows[0] ? buildDeviceFromRow(rows[0]) : null;
};

const getDevicesByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const { rows } = await query(
    "SELECT * FROM devices WHERE id = ANY($1::text[])",
    [ids.map(String)]
  );
  return rows.map(buildDeviceFromRow).filter((device) => device !== null);
};

export { getAllDevices, getDeviceById, getDeviceBrands, getDeviceCatalog, getDevicesByIds };
