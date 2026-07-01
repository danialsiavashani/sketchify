"use client";

import { Slider } from "@/components/ui/slider";
import { SketchParams } from "@/hooks/useSketchGenerator";

interface SketchControlsProps {
  params: SketchParams;
  onParamChange: (key: keyof SketchParams, value: number) => void;
}

export function SketchControls({ params, onParamChange }: SketchControlsProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span>Detail Level</span>
          <span className="text-muted-foreground">{11 - params.blur_amount}</span>
        </div>
        <Slider
          min={1}
          max={10}
          value={[11 - params.blur_amount]}
          onValueChange={([v]) => onParamChange("blur_amount", 11 - v)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span>Edge Sensitivity</span>
          <span className="text-muted-foreground">{params.edge_threshold_low}</span>
        </div>
        <Slider
          min={10}
          max={150}
          value={[params.edge_threshold_low]}
          onValueChange={([v]) => {
            onParamChange("edge_threshold_low", v);
            onParamChange("edge_threshold_high", v * 3);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span>Line Thickness</span>
          <span className="text-muted-foreground">{params.line_thickness}</span>
        </div>
        <Slider
          min={1}
          max={5}
          value={[params.line_thickness]}
          onValueChange={([v]) => onParamChange("line_thickness", v)}
        />
      </div>
    </div>
  );
}