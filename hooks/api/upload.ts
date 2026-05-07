"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { UploadFolder } from "@/types/api";

interface SignResp {
  url: string;
  key: string;
  headers?: Record<string, string>;
  expiresIn: number;
}

// POST /api/upload/sign
export function useSignUpload() {
  return useMutation({
    mutationFn: ({ folder, mime, size }: { folder: UploadFolder; mime: string; size: number }) =>
      api.post<SignResp>("/api/upload/sign", { folder, mime, size }),
  });
}

export async function putToS3(url: string, file: File | Blob, headers?: Record<string, string>) {
  const r = await fetch(url, {
    method: "PUT",
    body: file,
    headers,
  });
  if (!r.ok) throw new Error(`Upload failed: ${r.status}`);
}
