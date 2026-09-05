import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { DEMO_MODE } from "@/lib/demo";
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
  // DEMO_MODE: never read Firestore — queries resolve to empty data instead.
  return { uid, enabled: !DEMO_MODE && status === "authenticated" && Boolean(uid) };
}

export function useSubmissions() {
  const { uid, enabled } = useUid();
  return useQuery({
    queryKey: ["submissions", uid],
    enabled,
    placeholderData: DEMO_MODE ? [] : undefined,
    queryFn: () => submissionService.list(uid!),
  });
}

export function useSubmission(id: string) {
  const { enabled } = useUid();
  return useQuery({
    queryKey: ["submission", id],
    enabled: enabled && Boolean(id),
    placeholderData: DEMO_MODE ? null : undefined,
    queryFn: () => submissionService.get(id),
  });
}

export function useAnalysisForSubmission(submissionId: string) {
  const { enabled } = useUid();
  return useQuery({
    queryKey: ["analysis", submissionId],
    enabled: enabled && Boolean(submissionId),
    placeholderData: DEMO_MODE ? null : undefined,
    queryFn: () => analysisService.forSubmission(submissionId),
  });
}

export function useLanguages() {
  const { uid, enabled } = useUid();
  return useQuery({
    queryKey: ["languages", uid],
    enabled,
    placeholderData: DEMO_MODE ? [] : undefined,
    queryFn: () => languageService.list(uid!),
  });
}

export function useMistakes() {
  const { uid, enabled } = useUid();
  return useQuery({
    queryKey: ["mistakes", uid],
    enabled,
    placeholderData: DEMO_MODE ? [] : undefined,
    queryFn: () => mistakeService.list(uid!),
  });
}

export function useStudyNotes() {
  const { uid, enabled } = useUid();
  return useQuery({
    queryKey: ["study_notes", uid],
    enabled,
    placeholderData: DEMO_MODE ? [] : undefined,
    queryFn: () => studyNoteService.list(uid!),
  });
}

export function useProgress() {
  const { uid, enabled } = useUid();
  return useQuery({
    queryKey: ["progress", uid],
    enabled,
    placeholderData: DEMO_MODE ? [] : undefined,
    queryFn: () => progressService.list(uid!),
  });
}

export function useVocabulary() {
  const { uid, enabled } = useUid();
  return useQuery({
    queryKey: ["vocabulary", uid],
    enabled,
    placeholderData: DEMO_MODE ? [] : undefined,
    queryFn: () => vocabularyService.list(uid!),
  });
}
