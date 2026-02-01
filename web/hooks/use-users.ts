"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, DbUser, Role } from "@/lib/api";
import { TOAST_MESSAGES } from "@/lib/toast";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.getUsers(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      api.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(TOAST_MESSAGES.ROLE_UPDATED);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ERROR_GENERIC);
    },
  });
}
