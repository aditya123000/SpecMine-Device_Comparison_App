export const DEVICE_SECTIONS = [
  {
    key: "phones",
    label: "Phones",
    path: "/devices",
    description: "Smartphones and mobile devices.",
  },
  {
    key: "laptops",
    label: "Laptops",
    path: "/devices/laptops",
    description: "Portable computers for work, gaming, and daily use.",
  },
  {
    key: "tablets",
    label: "Tablets",
    path: "/devices/tablets",
    description: "Touch-first tablets for media and productivity.",
  },
  {
    key: "earbuds",
    label: "Earbuds",
    path: "/devices/earbuds",
    description: "True wireless earbuds for calls and music.",
  },
  {
    key: "headphones",
    label: "Headphones",
    path: "/devices/headphones",
    description: "Over-ear and on-ear audio gear.",
  },
  {
    key: "tvs",
    label: "TVs",
    path: "/devices/tvs",
    description: "Smart TVs and entertainment displays.",
  },
];

const SECTION_ALIASES = {
  phones: ["phone", "smartphone", "mobile", "mobiles", "cellphone"],
  laptops: ["laptop", "notebook", "ultrabook"],
  tablets: ["tablet", "tab", "ipad"],
  earbuds: ["earbud", "buds", "tws"],
  headphones: ["headphone", "headset"],
  tvs: ["tv", "television", "smarttv", "smart-tv"],
};

const DEFAULT_SECTION = "phones";

const normalizeSectionValue = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .trim();

export const getSectionMeta = (sectionKey) =>
  DEVICE_SECTIONS.find((section) => section.key === sectionKey) || DEVICE_SECTIONS[0];

export const getDeviceSectionKey = (device) => {
  const rawValue = normalizeSectionValue(device?.category || device?.section || device?.type);
  if (!rawValue) return DEFAULT_SECTION;

  if (SECTION_ALIASES[rawValue]) return rawValue;

  const matchedSection = Object.entries(SECTION_ALIASES).find(([, aliases]) =>
    aliases.some((alias) => normalizeSectionValue(alias) === rawValue)
  );

  return matchedSection ? matchedSection[0] : DEFAULT_SECTION;
};

export const filterDevicesBySection = (devices, sectionKey) => {
  return devices.filter((device) => getDeviceSectionKey(device) === sectionKey);
};
