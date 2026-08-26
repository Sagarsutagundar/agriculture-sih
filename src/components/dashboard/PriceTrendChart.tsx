"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CropQuote } from "@/data/types";
import { formatINR } from "@/lib/format";

type Range = "7d" | "30d" | "90d";

export default function PriceTrendChart({
  quote,
  accent = "var(--color-primary)",
}: {
  quote: CropQuote;
  accent?: string;
}) {
  const [range, setRange] = useState<Range>("7d");

  const data = useMemo(() => {
    const points =
      range === "7d"
        ? quote.history7d
        : range === "30d"
          ? quote.history30d
          : quote.history90d;
    return points.map((point) => ({
      ...point,
      price: Number(point.price.toFixed(2)),
    }));
  }, [quote, range]);

  const prices = data.map((point) => point.price);
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const average = prices.reduce((sum, value) => sum + value, 0) / prices.length;

  return (
    <div className="price-chart">
      <div className="price-chart__ranges">
        {(["7d", "30d", "90d"] as Range[]).map((item) => (
          <button
            key={item}
            type="button"
            className={range === item ? "is-active" : ""}
            onClick={() => setRange(item)}
          >
            {item === "7d" ? "7 Days" : item === "30d" ? "30 Days" : "3 Months"}
          </button>
        ))}
      </div>

      <div className="price-chart__stats">
        <span>High {formatINR(high)}</span>
        <span>Low {formatINR(low)}</span>
        <span>Avg {formatINR(average)}</span>
        <span>Current {formatINR(quote.currentPrice)}</span>
      </div>

      <div className="price-chart__canvas">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eee8" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis
              tick={{ fontSize: 11 }}
              domain={["auto", "auto"]}
              tickFormatter={(value: number) => `₹${Math.round(value)}`}
            />
            <Tooltip
              formatter={(value) => formatINR(Number(value))}
              labelStyle={{ fontWeight: 700 }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={accent}
              strokeWidth={3}
              dot={false}
              isAnimationActive
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
