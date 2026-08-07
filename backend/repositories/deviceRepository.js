import { query } from "../config/db.js";
import { normalizeDevice } from "../utils/normalizeDevice.js";

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

const getDeviceById = async (id) => {
  const { rows } = await query(
    "SELECT * FROM devices WHERE id = $1",
    [String(id)]
  );
  return rows[0] ? buildDeviceFromRow(rows[0]) : null;
};

export { getAllDevices, getDeviceById };
