"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

type ToastItem = { id: number; text: string; type?: "success" | "error" | "info" };
type Ctx = { push: (text: string, type?: ToastItem["type"]) => void };

const ToastContext = createContext<Ctx>({ push: () => {} });
export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((text: string, type: ToastItem["type"] = "info") => {
    const id = Date.now();
    setItems((s) => [...s, { id, text, type }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3500);
  }, []);

  // پرهیز از <Context.Provider> با dot-notation
  const Provider = ToastContext.Provider;

  return (
    <Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {items.map((i) => (
          <div
            key={i.id}
            className={`rounded-xl px-4 py-2 shadow-lg bg-white/80 backdrop-blur border
              ${i.type === "error" ? "border-red-400" : "border-emerald-400"}`}
          >
            <span className="text-sm">{i.text}</span>
          </div>
        ))}
      </div>
    </Provider>
  );
}
