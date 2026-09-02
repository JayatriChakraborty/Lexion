import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import {
  analysisService,
  languageService,
  mistakeService,
  progressService,
  studyNoteService,
  submissionService,
  vocabularyService,
} from "@/services";

function useUid() {
  const { uid, status } = useAuth();
  return { uid, enabled: status === "authenticated" && Boolean(uid) };
}

export function useSubmissions() {
  const { uid, enabled } = useUid();
  return useQuery({
    queryKey: ["submissions", uid],
    enabled,
    queryFn: () => submissionService.list(uid!),
  });
}

export function useSubmission(id: string) {
  const { enabled } = useUid();
  return useQuery({
    queryKey: ["submission", id],
    enabled: enabled && Boolean(id),
    queryFn: () => submissionService.get(id),
  });
}

export function useAnalysisForSubmission(submissionId: string) {
  const { enabled } = useUid();
  return useQuery({
    queryKey: ["analysis", submissionId],
    enabled: enabled && Boolean(submissionId),
    queryFn: () => analysisService.forSubmission(submissionId),
  });
}

export function useLanguages() {
  const { uid, enabled } = useUid();
  return useQuery({ queryKey: ["languages", uid], enabled, queryFn: () => languageService.list(uid!) });
}

export function useMistakes() {
  const { uid, enabled } = useUid();
  return useQuery({ queryKey: ["mistakes", uid], enabled, queryFn: () => mistakeService.list(uid!) });
}

export function useStudyNotes() {
  const { uid, enabled } = useUid();
  return useQuery({ queryKey: ["study_notes", uid], enabled, queryFn: () => studyNoteService.list(uid!) });
}

export function useProgress() {
  const { uid, enabled } = useUid();
  return useQuery({ queryKey: ["progress", uid], enabled, queryFn: () => progressService.list(uid!) });
}

export function useVocabulary() {
  const { uid, enabled } = useUid();
  return useQuery({ queryKey: ["vocabulary", uid], enabled, queryFn: () => vocabularyService.list(uid!) });
}
