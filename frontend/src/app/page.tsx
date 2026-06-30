import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Sketchify</h1>
        <p className="text-muted-foreground">
          Turn any photo into a pencil-sketch-style image. Upload, adjust the
          look, and download your result.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}