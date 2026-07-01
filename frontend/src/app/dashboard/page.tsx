"use client";

import { useSketchGenerator } from "@/hooks/useSketchGenerator";
import { ImageUpload } from "@/components/image-upload";
import { SketchControls } from "@/components/sketch-controls";
import { SketchResult } from "@/components/sketch-result";
import { QuotaDisplay } from "@/components/quota-display";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const {
    preview,
    result,
    isGenerating,
    error,
    quota,
    params,
    fileInputRef,
    handleFileChange,
    handleDrop,
    updateParam,
    handleGenerate,
    image,
  } = useSketchGenerator();

  const quotaExceeded = quota && quota.used >= quota.limit;

  return (
    <div className="flex flex-1 p-6 gap-8 max-w-6xl mx-auto w-full">
      {/* Left — controls + generate + quota */}
      <div className="flex w-64 flex-col gap-6 shrink-0">
        <SketchControls params={params} onParamChange={updateParam} />

        {error && <p className="text-sm text-destructive">{error}</p>}

        {quota && <QuotaDisplay quota={quota} />}

        {!quotaExceeded && (
          <Button
            onClick={handleGenerate}
            disabled={!image || isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Sketch"}
          </Button>
        )}
      </div>

      {/* Right — image upload + result */}
      <div className="flex flex-1 flex-col gap-4">
        <ImageUpload
          preview={preview}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
        />
        {result && <SketchResult result={result} />}
      </div>
    </div>
  );
}