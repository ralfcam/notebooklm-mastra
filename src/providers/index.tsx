"use client";

import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import { useSessionStorage } from "@uidotdev/usehooks";
import { useRouter } from "next/navigation";

export const SessionContext = createContext<{ sessionId: string | null }>({
  sessionId: null,
});

export const useSession = () => {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error("useSession must be used inside the SessionProvider");
  }

  return session;
};

const SessionProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const [sessionId, setSessionId] = useSessionStorage<string | null>(
    "notebooklm:sessionId",
    null,
  );

  useEffect(() => {
    if (!sessionId) {
      const uuid = window.crypto.randomUUID();
      setSessionId(uuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      router.push(`?sessionId=${sessionId}`);
    }
  }, [router, sessionId]);

  if (!sessionId) return null;

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
