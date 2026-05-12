export const CATEGORY_LABELS: Record<string, string> = {
  soup_stew: "국/찌개",
  stir_fry: "볶음",
  grill: "구이",
  braise: "조림",
  steam: "찜",
  jeon: "전/부침",
  bibim: "비빔",
  muchim: "무침",
  noodle: "면",
  rice: "밥",
  dessert: "디저트",
  salad: "샐러드",
  other: "기타",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
);
