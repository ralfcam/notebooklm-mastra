import { WelcomeCard } from "@/components/custom/welcome-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchNotebooks } from "@/db/queries/notebooks";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function Home() {
  const notebooks = await fetchNotebooks();

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
          <div>
            <h1 className="text-6xl font-semibold">
              Welcome to Mastra NotebookLM
            </h1>
            <hr />
            <div className="space-y-8">
              <Button type="submit">Create new</Button>
              <div className="grow flex flex-wrap content-start gap-8 w-full">
                {notebooks.map((notebook) => (
                  <Link key={notebook.id} href={`/notebook/${notebook.id}`}>
                    <Card className="size-64">
                      <CardHeader>
                        <CardTitle className="truncate">
                          {notebook.name}
                        </CardTitle>
                        <CardDescription>
                          {formatDate(new Date(notebook.createdAt))}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
