"use client";
import React, { useEffect, useRef, memo } from "react";

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // clear biar gak double inject script
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "PEPPERSTONE:XAUUSD",
        "interval": "1",
        "timezone": "Asia/Jakarta",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "hide_volume": true,
        "allow_symbol_change": true,
        "hide_side_toolbar": false,
        "hide_top_toolbar": false,
        "withdateranges": true,
         "show_popup_button": true,
         "popup_height": "650",
         "popup_width": "1000",
        "watchlist": [
          "CAPITALCOM:DXY",
          "BITSTAMP:BTCUSD",
          "AMEX:SPY",
          "PEPPERSTONE:EURUSD",
          "PEPPERSTONE:GBPUSD",
          "PEPPERSTONE:USDCHF",
          "PEPPERSTONE:USDCAD",
          "PEPPERSTONE:AUDUSD",
          "PEPPERSTONE:GBPJPY",
          "PEPPERSTONE:USDIDR",
          "PEPPERSTONE:USDJPY",
          "PEPPERSTONE:AUDJPY"
        ]
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container w-full h-[600px]"
      ref={container}
    >
      <div className="tradingview-widget-container__widget w-full h-full" />
    </div>
  );
}

export default memo(TradingViewWidget);
