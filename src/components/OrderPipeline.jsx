import React from 'react';
import { Clock, Check, Package, Truck, CheckCircle2 } from 'lucide-react';

export const PIPELINE = [
  { key: "Pending", label: "Pending", Icon: Clock, color: "text-amber-500", ring: "ring-amber-400" },
  { key: "Confirmed", label: "Confirmed", Icon: Check, color: "text-sky-500", ring: "ring-sky-400" },
  { key: "Ready to Pick Up", label: "Packed", Icon: Package, color: "text-violet-500", ring: "ring-violet-400" },
  { key: "Out for Delivery", label: "Dispatched", Icon: Truck, color: "text-indigo-500", ring: "ring-indigo-400" },
  { key: "Delivered", label: "Delivered", Icon: CheckCircle2, color: "text-emerald-500", ring: "ring-emerald-400" },
];

export default function OrderPipeline({ currentStatus }) {
  const idx = PIPELINE.findIndex(
    (s) => s.key.toLowerCase() === currentStatus?.toLowerCase()
  );
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto pb-1">
      {PIPELINE.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1 min-w-[56px]">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500
                  ${active ? `bg-white ${step.ring} ring-2 shadow-lg` : done ? "bg-emerald-500 border-emerald-500" : "bg-slate-100 border-slate-200"}
                `}
              >
                {done ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <step.Icon
                    className={`w-4 h-4 ${active ? step.color : "text-slate-400"}`}
                  />
                )}
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider text-center leading-tight ${active ? step.color : done ? "text-emerald-600" : "text-slate-400"}`}
              >
                {step.label}
              </span>
            </div>
            {i < PIPELINE.length - 1 && (
              <div
                className={`flex-1 h-0.5 mb-4 transition-all duration-500 ${i < idx ? "bg-emerald-400" : "bg-slate-200"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
