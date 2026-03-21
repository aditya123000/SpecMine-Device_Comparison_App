import { query } from "../Config/db.js";

const getAllDevices = async (limit) => {
  const params = [];
  let sql = `
    SELECT payload
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
  return rows.map(({ payload }) => payload);
};

const getDeviceById = async (id) => {
  const { rows } = await query("SELECT payload FROM devices WHERE id = $1", [String(id)]);
  return rows[0]?.payload ?? null;
};

export { getAllDevices, getDeviceById };
