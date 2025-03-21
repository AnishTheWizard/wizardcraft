"use client";

import { useEffect, useRef } from "react";

export default function Console({ logs }: { logs: string[] }) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <>
      {logs.map((log: string, index: number) => (
        <div
          key={index}
          className={`py-0.5 ${log.includes("[ERROR]") ? "text-red-400" : ""} ${log.startsWith(">") ? "text-white" : ""}`.trim()}
        >
          {log}
        </div>
      ))}
      <div ref={logsEndRef} />
    </>
  );
}
