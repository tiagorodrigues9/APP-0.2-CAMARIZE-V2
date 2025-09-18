import HomeContent from "@/components/HomeContent";
import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('usuarioCamarize');
      const user = raw ? JSON.parse(raw) : null;
      const role = user?.role || 'membro';
      if (role === 'master') window.location.replace('/master');
      else if (role === 'admin') window.location.replace('/admin');
    } catch {}
  }, []);
  return <HomeContent />;
}