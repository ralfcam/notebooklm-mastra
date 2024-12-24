import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { File } from "lucide-react";
import { Badge } from "../ui/badge";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

interface SourceItemProps {
  name: string;
  content: string;
  summary: string;
  keyTopics: string[];
  disabled: boolean;
}
export const SourceItem: React.FC<SourceItemProps> = ({
  name,
  content,
  summary,
  keyTopics,
  disabled,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild disabled={disabled}>
        <Button variant="secondary" className="w-full justify-start">
          <File />
          <span className="truncate">{name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="underline">{name}</DialogTitle>
          <DialogDescription>
            <span className="font-semibold">AI summary: </span>
            {summary}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 flex-wrap">
          {keyTopics.map((topic) => (
            <Badge variant="default" key={topic}>
              {topic}
            </Badge>
          ))}
        </div>

        <div className="bg-secondary text-muted-foreground rounded">
          <p className="font-semibold p-2 text-sm">Content</p>
          <hr />
          <ScrollArea className="max-w-md">
            <ScrollArea className="p-2 h-96 text-sm">{content}</ScrollArea>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
