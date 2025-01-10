import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const StatusCard: React.FC = () => {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Notebook status</CardTitle>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
};
