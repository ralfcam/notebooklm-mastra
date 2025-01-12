import { NotebooksView } from "@/components/custom/notebooks-view";
import { WelcomeCard } from "@/components/custom/welcome-card";
import { fetchNotebooks } from "@/db/queries/notebooks";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const sessionId = (await searchParams).sessionId;

  if (!sessionId) return null;

  const notebooks = await fetchNotebooks(sessionId);

  return (
    <main className="min-h-screen relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-100 opacity-50 blur-3xl" />
        <div className="absolute top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-teal-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] rounded-full bg-purple-100 opacity-50 blur-3xl" />
        <div className="absolute top-[0%] -right-[0%] w-[50%] h-[70%] rounded-full bg-red-100 opacity-50 blur-3xl" />
        <div className="absolute bottom-[0%] -left-[0%] w-[50%] h-[70%] rounded-full bg-orange-100 opacity-50 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative min-h-screen flex items-center">
        {notebooks.length === 0 ? (
          <WelcomeCard />
        ) : (
          <NotebooksView notebooks={notebooks} />
        )}
      </div>
    </main>
  );
}
