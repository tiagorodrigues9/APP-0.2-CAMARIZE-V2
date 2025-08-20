import { useEffect } from "react";
import { useRouter } from "next/router";

export default function FazendaRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/register-fazenda");
  }, [router]);
  return null;
} 