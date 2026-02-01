export const percentRangeColors = [
  {
    min: Number.NEGATIVE_INFINITY,
    max: -20,
    color: "#D73B51",
  },
  { min: -20, max: -10, color: "#F1475C" },
  { min: -10, max: -0, color: "#F96E80" },
  { min: -0, max: +0, color: "#77808F" },
  { min: +0, max: +10, color: "#48D69D" },
  { min: +10, max: +20, color: "#0FCB80" },
  {
    min: +20,
    max: Number.POSITIVE_INFINITY,
    color: "#0EAF6F",
  },
];
export const fundingRateColors = [
  {
    min: -Infinity,
    max: -0.01,
    color: "#D73B51",
  },
  { min: -0.01, max: -0.005, color: "#F1475C" },
  { min: -0.005, max: -0.0, color: "#F96E80" },
  { min: -0.0, max: +0.0, color: "#77808F" },
  { min: +0.0, max: +0.005, color: "#48D69D" },
  { min: +0.005, max: +0.01, color: "#0FCB80" },
  {
    min: +0.01,
    max: +Infinity,
    color: "#0EAF6F",
  },
];
export const getColor = (dataCoverage, indicator) => {
  let retcolor = "#77808F";
  let listCheck = percentRangeColors;
  if (indicator === "Funding Rates") {
    listCheck = fundingRateColors;
  }
  // console.log("dataCoverage", dataCoverage);
  const rangeMatch = listCheck.find((range) => {
    const val = Number(dataCoverage);
    return val >= range.min && val < range.max;
  });
  if (rangeMatch) {
    retcolor = rangeMatch.color;
  }
  return retcolor;
};

export const getColorList = (indicator) => {
  if (indicator === "Funding Rates") {
    return fundingRateColors;
  } else {
    return percentRangeColors;
  }
};
