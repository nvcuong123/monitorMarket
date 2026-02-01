// ref https://stackblitz.com/edit/vitejs-vite-ptbfk9?file=src%2FTreemapChart.tsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";
import { useEffect, useState } from "react";
import { Chart } from "react-chartjs-2";
import { getColor } from "./ColorRange";
import { PercentChangeFormatter } from "../Utils/index.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TreemapController,
  TreemapElement
);

let options = {
  animation: false,
  plugins: {
    title: {
      display: true,
      text: "Price Change 24H",
    },
    legend: {
      display: false,
    },
    tooltip: {
      displayColors: true,
      callbacks: {
        title(items) {
          return items[0].raw._data.name;
        },
        label(item) {
          const {
            _data: { percentChange, dataCoverage, price, lastFundingRate },
          } = item.raw;

          return [
            `Price : ${price}`,
            `24h change: ${PercentChangeFormatter(percentChange)}`,
            `Funding Rate: ${Number(lastFundingRate).toFixed(4)}%`,
          ];
        },
      },
    },
  },
  aspectRatio: 1,
};

export default function TreemapChart(props) {
  const [data24h, $data24h] = useState();

  useEffect(() => {
    const indicator = props.indicator;
    const fundingRates = props.fundingRates;
    const topRangeValue = props.topRangeValue;
    // const prices = props.prices;
    const pricePrecisions = props.pricePrecisions;

    let data = {
      datasets: [
        {
          tree: [],
          key: "absPricePercent",
          labels: {
            display: true,
            align: "left",
            formatter: (context) => [
              context.raw._data.name,
              context.raw._data.price,
              `${PercentChangeFormatter(context.raw._data.percentChange)}`,
            ],
            color: "white",
            overflow: "fit",
            font: [
              {
                size: 20,
                style: "normal",
                weight: "bold",
              },
              {
                size: 14,
                style: "normal",
                weight: "bold",
              },
            ],
          },
          backgroundColor(context) {
            if (context.type !== "data") return "transparent";
            const { dataCoverage } = context.raw._data;
            return getColor(dataCoverage, indicator);
          },
          spacing: -0.5,
          borderWidth: 0.75,
          borderColor: "#000000",
          onclick: (element) => {
            console.log("element", element);
          },
        },
      ],
    };
    let data24hTemp = { ...data };
    let tree = [];
    const topChange24h = props.change24Hs.slice(0, topRangeValue);

    topChange24h.forEach((contract, idx) => {
      const fdObj = fundingRates?.find(
        (element) => element.symbol === contract.symbol
      );
      const lastFundingRate = Number(fdObj?.fundingRate * 100 || 0);
      let pricePrecision = pricePrecisions[contract.symbol];
      if (pricePrecision < 0) pricePrecision = 0;
      tree.push({
        name: contract.symbol,
        // price: `$${Number(prices[contract.symbol]).toFixed(
        //   pricePrecisions[contract.symbol]
        // )}`,
        price: `$${Number(contract.close).toFixed(pricePrecision)}`,
        lastFundingRate: lastFundingRate,
        percentChange: contract.percentChange,
        absPricePercent: Math.abs(contract.percentChange),
        dataCoverage:
          indicator === "Funding Rates"
            ? lastFundingRate
            : contract.percentChange,
      });
      // if (idx === 0) {
      //   console.log("props.change24Hs:contract", contract);
      //   console.log("tree[idx]", idx, tree[idx]);
      // }
    });
    data24hTemp.datasets[0].tree = tree;
    $data24h(data24hTemp);
  }, [props]);

  return (
    <>{data24h && <Chart type="treemap" data={data24h} options={options} />}</>
  );
}
