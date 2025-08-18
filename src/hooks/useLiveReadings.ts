import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useLiveReadings() {
  const qc = useQueryClient();
  useEffect(() => {
    const base = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
    const es = new EventSource(`${base}/stream`);
    es.onmessage = (e) => {
      try {
        const evt = JSON.parse(e.data); // { type:'reading', data:{ deviceId, ts, ppm, ... } }
        if (evt.type === "reading") {
          const d = evt.data;
          qc.setQueryData<any[]>(["readings", d.deviceId], (old = []) => [...old, d]);
          qc.invalidateQueries({ queryKey: ["devices"] });
        }
      } catch {}
    };
    return () => es.close();
  }, [qc]);
}
