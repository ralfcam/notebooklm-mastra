import { StudioPanel } from "@/components/custom/studio-panel";
import { Badge } from "@/components/ui/badge";

interface NotebookPageProps {
  params: Promise<{ notebookId: string }>;
}

export default async function NotebookPage({ params }: NotebookPageProps) {
  const notebookId = (await params).notebookId;

  return (
    <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-3rem)] gap-8">
      {/* Summary center */}
      <div className="w-full max-w-3xl flex flex-col justify-center gap-3">
        <div className="text-4xl">📖</div>
        <h1 className="text-3xl font-semibold">Summary title goes here</h1>
        <p className="text-sm text-muted-foreground">4 sources</p>
        <p className="text-sm">
          A compelling cover letter that weaves personal experience with Bending
          Spoons&apos; products (WeTransfer, Evernote, StreamYard) into a career
          journey from filmmaking to software engineering. The applicant
          demonstrates both technical expertise from their role at Exponent and
          a genuine connection to the company&apos;s products, emphasizing their
          unique perspective as both a user and potential developer.
        </p>
        <div className="space-y-2">
          <h2 className="text-sm text-muted-foreground">Key topics</h2>
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Badge key={idx}>{idx * 1000000}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* TODO: Summary center empty state */}

      {/* Action center to generate podcast and show progress */}
      <StudioPanel notebookId={notebookId} />
    </div>
  );
}
