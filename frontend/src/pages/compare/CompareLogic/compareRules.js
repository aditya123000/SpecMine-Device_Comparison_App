export const COMPARE_RULES = {
  Brand: { type: "text" },
  LaunchYear: { type: "number", better: "higher" },
  Display: { type: "number", better: "higher" },
  Weight: { type: "number", better: "lower" },
  RefreshRate: { type: "number", better: "higher" },
  Processor: { type: "number", better: "higher" },
  RAM: { type: "number", better: "higher" },
  Storage: { type: "number", better: "higher" },
  FrontCamera: { type: "number", better: "higher" },
  BackCamera: { type: "number", better: "higher" },
  Camera: { type: "number", better: "higher" },
  Battery: { type: "number", better: "higher" },
  Charging: { type: "number", better: "higher" },
  OS: { type: "text" },
  Price: { type: "number", better: "lower" },
  Availability: { type: "status" }
};
