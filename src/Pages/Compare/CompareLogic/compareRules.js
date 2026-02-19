export const COMPARE_RULES = {
  Brand: { type: "text" },
  Display: { type: "number", better: "higher" },
  RefreshRate: { type: "number", better: "higher" },
  Processor: { type: "number", better: "higher" },
  RAM: { type: "number", better: "higher" },
  Storage: { type: "number", better: "higher" },
  Camera: { type: "number", better: "higher" },
  Battery: { type: "number", better: "higher" },
  Charging: { type: "number", better: "higher" },
  OS: { type: "number", better: "higher" },
  Price: { type: "number", better: "lower" },
  Availability: { type: "status" }
};
