"use client";

import { useMutation } from "@tanstack/react-query";
import { filesService } from "@/lib/api/services";
import type { UploadFileType } from "@/lib/api/dto";

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: UploadFileType }) => filesService.upload(file, type),
  });
}
