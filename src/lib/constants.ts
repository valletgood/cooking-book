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
  fried: "튀김",
  hotpot: "전골/탕",
  side_dish: "밑반찬",
  kimchi_pickle: "김치/절임",
  sauce: "소스/양념장",
  lunchbox: "도시락",
  snack: "간식",
  drink: "음료",
  salad: "샐러드",
  other: "기타",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
);
