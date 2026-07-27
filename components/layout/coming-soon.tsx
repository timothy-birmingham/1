import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  bullets,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Icon className="size-6 text-muted-foreground" />
          </span>
          <div>
            <p className="font-medium">Coming soon</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              This area is on the roadmap. Planned capabilities include:
            </p>
          </div>
          <ul className="mx-auto flex max-w-md flex-col gap-1.5 text-left text-sm text-muted-foreground">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
                {bullet}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
