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
import { CurrencyFormatter } from "../Utils/index";
import { getColor } from "./ColorRange";
import { PercentChangeFormatter } from "../Utils/index";

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
      text: "Trading Volume 24H",
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
            _data: { percentChange, quoteVolume, price, lastFundingRate },
          } = item.raw;

          return [
            `Price : ${price}`,
            `Volume 24H: ${CurrencyFormatter.format(quoteVolume)}`,
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
          key: "quoteVolume",
          labels: {
            display: true,
            align: "left",
            formatter: (context) => [
              context.raw._data.name,
              context.raw._data.price,
              `Vol: ${CurrencyFormatter.format(context.raw._data.quoteVolume)}`,
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
    props.tradingVol24H.slice(0, topRangeValue).forEach((contract, idx) => {
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
        volume: contract.volume,
        quoteVolume: contract.quoteVolume,
        percentChange: contract.percentChange,
        dataCoverage:
          indicator === "Funding Rates"
            ? lastFundingRate
            : contract.percentChange,
      });
    });
    data24hTemp.datasets[0].tree = tree;
    $data24h(data24hTemp);
  }, [props]);

  return (
    <>{data24h && <Chart type="treemap" data={data24h} options={options} />}</>
  );
}
