"use client";

import { useState, useRef } from "react";

export interface SketchParams {
  blur_amount: number;
  edge_threshold_low: number;
  edge_threshold_high: number;
  line_thickness: number;
}

export interface QuotaInfo {
  used: number;
  limit: number;
}

const DEFAULT_PARAMS: SketchParams = {
  blur_amount: 5,
  edge_threshold_low: 50,
  edge_threshold_high: 150,
  line_thickness: 1,
};

export function useSketchGenerator() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [params, setParams] = useState<SketchParams>(DEFAULT_PARAMS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(file: File) {
    setImage(file);
    setResult(null);
    setError(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileChange(file);
    }
  }

  function updateParam(key: keyof SketchParams, value: number) {
    setParams((p) => ({ ...p, [key]: value }));
  }

  async function handleGenerate() {
    if (!image) return;
    setIsGenerating(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("blur_amount", String(params.blur_amount));
    formData.append("edge_threshold_low", String(params.edge_threshold_low));
    formData.append("edge_threshold_high", String(params.edge_threshold_high));
    formData.append("line_thickness", String(params.line_thickness));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          res.status === 429
            ? "Daily quota exceeded. Upgrade to Pro for more generations."
            : data.detail ?? "Something went wrong."
        );
        return;
      }

      setResult(data.result_url);
      setQuota({ used: data.generations_used, limit: data.daily_limit });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return {
    image,
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
  };
}