// website/src/app/admin/calendar/page.tsx
"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import faLocale from "@fullcalendar/core/locales/fa";
import { useState, useEffect } from "react";
import api from "@/lib/api";

// اگر CSSهای فول‌کلندر را قبلاً اضافه نکرده‌اید، این 3 خط را در بالاترین فایل global (مثلاً globals.css) هم می‌توانید ایمپورت کنید:
// @import "@fullcalendar/common/main.css";
// @import "@fullcalendar/daygrid/main.css";
// @import "@fullcalendar/timegrid/main.css";

type EventInput = { id?: string; title: string; start: string; end?: string; };

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/turns/calendar/"); // خروجی را مطابق API واقعی خود برگردانید
        setEvents(data);
      } catch {
        // داده‌ی نمونه
        setEvents([
          { id:"1", title: "مشاوره فردی", start: new Date().toISOString() },
          { id:"2", title: "کلینیک گروهی", start: new Date(new Date().setHours(15,0,0)).toISOString() },
        ]);
      }
    })();
  }, []);

  const onSelect = async (info: any) => {
    const title = prompt("عنوان رویداد:");
    if (!title) return;
    const ev = { title, start: info.startStr, end: info.endStr };
    // await api.post("/api/turns/calendar/", ev);
    setEvents((s) => s.concat(ev));
  };

  return (
    <div className="rounded-2xl border p-4 bg-white dark:bg-zinc-900">
      <div className="mb-3 font-semibold">تقویم نوبت‌دهی</div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ start: "title", center: "", end: "prev,next dayGridMonth,timeGridWeek,timeGridDay" }}
        selectable
        locale={faLocale}
        direction="rtl"
        events={events}
        select={onSelect}
        height="auto"
      />
    </div>
  );
}
