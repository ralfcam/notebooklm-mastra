export default async function NotebookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const notebookId = (await params).id;

  return <div>{notebookId}</div>;
}
