"use client";

import { Button } from "@/components/ui/button";
import { QuotaInfo } from "@/hooks/useSketchGenerator";

interface QuotaDisplayProps {
  quota: QuotaInfo;
}

export function QuotaDisplay({ quota }: QuotaDisplayProps) {
  const exceeded = quota.used >= quota.limit;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-muted-foreground">
        {quota.used}/{quota.limit} generations used today
      </p>
      {exceeded && (
        <>
          <p className="text-sm text-destructive">
            You've used all your generations for today.
          </p>
          <Button>Upgrade to Pro</Button>
        </>
      )}
    </div>
  );
}