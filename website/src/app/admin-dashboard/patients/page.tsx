// website/src/app/admin/patients/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
  ColumnDef, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel,
} from "@tanstack/react-table";

type Patient = { id: number; national_id: string; full_name: string; mobile: string; last_visit?: string; debt?: number; };

export default function PatientsPage() {
  const [data, setData] = useState<Patient[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/patients/");
        setData(data);
      } catch {
        setData([
          { id:1, national_id:"1234567890", full_name:"فاطمه زهرا توسلی", mobile:"0912...", last_visit:"1402-06-24", debt: 1200000 },
          { id:2, national_id:"0987654321", full_name:"رضا عباسیان", mobile:"0913...", last_visit:"1402-06-18", debt: 0 },
        ]);
      }
    })();
  }, []);

  const columns = useMemo<ColumnDef<Patient>[]>(() => [
    { header: "کد", accessorKey: "id" },
    { header: "کد ملی", accessorKey: "national_id" },
    { header: "نام و نام‌خانوادگی", accessorKey: "full_name" },
    { header: "موبایل", accessorKey: "mobile" },
    { header: "آخرین مراجعه", accessorKey: "last_visit" },
    { header: "بدهی (ریال)", accessorKey: "debt",
      cell: ({getValue}) => (Number(getValue()||0)).toLocaleString()
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: q },
    onGlobalFilterChange: setQ,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">لیست بیماران</h1>
      <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="جستجو..."
             className="w-full max-w-sm rounded-lg border p-2" />
      <div className="overflow-auto rounded-2xl border">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            {table.getHeaderGroups().map(hg=>(
              <tr key={hg.id}>
                {hg.headers.map(h=>(
                  <th key={h.id} className="text-right p-3 font-semibold">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(r=>(
              <tr key={r.id} className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800">
                {r.getVisibleCells().map(c=>(
                  <td key={c.id} className="p-3">{flexRender(c.column.columnDef.cell, c.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
