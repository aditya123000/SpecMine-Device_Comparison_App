import { query } from "../Config/db.js";
import { normalizeDevice } from "../Utils/normalizeDevice.js";

const buildDeviceFromRow = (row) => {
  const { id, brand, model, category, price, payload } = row;

  if (payload && typeof payload === "object") {
    return normalizeDevice(payload);
  }

  return normalizeDevice({
    id,
    brand,
    model,
    category,
    price,
  });
};

const getAllDevices = async (limit) => {
  const params = [];
  let sql = `
    SELECT id, brand, model, category, price, payload
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

const getDeviceById = async (id) => {
  const { rows } = await query(
    "SELECT id, brand, model, category, price, payload FROM devices WHERE id = $1",
    [String(id)]
  );
  return rows[0] ? buildDeviceFromRow(rows[0]) : null;
};

export { getAllDevices, getDeviceById };

