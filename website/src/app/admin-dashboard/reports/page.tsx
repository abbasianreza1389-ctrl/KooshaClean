"use client";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useI18n } from "@/components/Providers";

type Row = { id:number; title:string; start:string; end?:string; amount:number; };

export default function ReportsPage(){
  const {t} = useI18n();
  const [from,setFrom] = useState<string>(""); const [to,setTo] = useState<string>("");
  const [rows,setRows] = useState<Row[]>([]);

  const fetchData = async () => {
    try{
      const {data} = await api.get("/api/reports/finance", { params:{from,to}});
      setRows(data);
    }catch{
      // نمونه
      setRows([
        {id:1,title:"جلسه درمانی", start:"1402-06-01", amount: 1800000},
        {id:2,title:"ویزیت",        start:"1402-06-02", amount: 600000},
      ]);
    }
  };
  useEffect(()=>{ fetchData(); }, []);

  const columns = useMemo<ColumnDef<Row>[]>(()=>[
    { header:"#", accessorKey:"id"},
    { header:t("title"), accessorKey:"title"},
    { header:t("start"), accessorKey:"start"},
    { header:t("end"), accessorKey:"end"},
    { header:t("amount"), accessorKey:"amount",
      cell:({getValue})=>(Number(getValue()||0)).toLocaleString()}
  ],[t]);

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });
  const total = rows.reduce((s,r)=>s+(r.amount||0),0);

  const exportCsv = () => {
    const headers = ["id","title","start","end","amount"];
    const csv = [headers.join(","), ...rows.map(r=>headers.map(h=>(r as any)[h]).join(","))].join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "finance.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("reports")}</h1>

      <div className="flex flex-wrap gap-2 items-end">
        <label className="flex flex-col">
          <span className="text-sm">{t("from")}</span>
          <input type="date" className="border rounded-lg p-2" value={from} onChange={e=>setFrom(e.target.value)} />
        </label>
        <label className="flex flex-col">
          <span className="text-sm">{t("to")}</span>
          <input type="date" className="border rounded-lg p-2" value={to} onChange={e=>setTo(e.target.value)} />
        </label>
        <button onClick={fetchData} className="rounded-lg border px-3 py-2">{t("apply")}</button>
        <div className="ms-auto flex gap-2">
          <button onClick={()=>window.print()} className="rounded-lg border px-3 py-2 print:hidden">{t("print")}</button>
          <button onClick={exportCsv} className="rounded-lg border px-3 py-2">{t("exportCsv")}</button>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border">
        <table className="min-w-[700px] w-full text-sm">
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
                  <td key={c.id} className="p-3">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="p-3 font-bold" colSpan={4}>جمع</td>
              <td className="p-3 font-bold">{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
