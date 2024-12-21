import { createNotebook } from "@/actions/notebooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchNotebooks } from "@/db/queries/notebooks";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function Home() {
  const notebooks = await fetchNotebooks();

  return (
    <main className="min-h-screen flex flex-col justify-center items-center">
      <div className="flex flex-col gap-8 h-[60vh] px-8">
        <h1 className="text-6xl font-semibold">Welcome to Mastra NotebookLM</h1>
        <hr />
        <div className="max-w-7xl">
          {notebooks.length && (
            <div className="space-y-8">
              <form action={createNotebook}>
                <Button type="submit">Create new</Button>
              </form>
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
          )}
          {!notebooks.length && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="">Create your first notebook</CardTitle>
                <CardDescription className="">
                  Mastra NotebookLM is an AI-powered research and writing
                  assistant that works best with the sources you upload
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-center">
                <form action={createNotebook}>
                  <Button size="lg" type="submit">
                    Create
                  </Button>
                </form>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
