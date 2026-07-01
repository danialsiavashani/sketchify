"use client";

import { Button } from "@/components/ui/button";

interface SketchResultProps {
  result: string;
}

export function SketchResult({ result }: SketchResultProps) {
  return (
    <div className="w-full flex flex-col items-center gap-3">
      <img
        src={result}
        alt="Sketch result"
        className="max-h-96 rounded-lg object-contain w-full"
      />
      <a href={result} download="sketch.png">
        <Button variant="outline">Download</Button>
      </a>
    </div>
  );
}