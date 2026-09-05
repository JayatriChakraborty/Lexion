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
import type { AnalysisBundle } from "@/services/analysisService";
import type { LanguageRecord } from "@/services/languageService";
import type { MistakeRecord } from "@/services/mistakeService";
import type { ProgressRecord } from "@/services/progressService";
import type { StudyNoteRecord } from "@/services/studyNoteService";
import type { SubmissionRecord } from "@/services/submissionService";
import type { VocabularyRecord } from "@/services/vocabularyService";

function useUid() {
  const { uid, status } = useAuth();
  return { uid, enabled: status === "authenticated" && Boolean(uid) };
}

export function useSubmissions() {
  const { uid, enabled } = useUid();
  return useQuery<SubmissionRecord[]>({
    queryKey: ["submissions", uid],
    enabled,
    // DEMO_MODE: resolve to empty data — no Firestore read.
    queryFn: () => (DEMO_MODE ? [] : submissionService.list(uid!)),
  });
}

export function useSubmission(id: string) {
  const { enabled } = useUid();
  return useQuery<SubmissionRecord | null>({
    queryKey: ["submission", id],
    enabled: enabled && Boolean(id),
    queryFn: () => (DEMO_MODE ? null : submissionService.get(id)),
  });
}

export function useAnalysisForSubmission(submissionId: string) {
  const { enabled } = useUid();
  return useQuery<AnalysisBundle | null>({
    queryKey: ["analysis", submissionId],
    enabled: enabled && Boolean(submissionId),
    queryFn: () => (DEMO_MODE ? null : analysisService.forSubmission(submissionId)),
  });
}

export function useLanguages() {
  const { uid, enabled } = useUid();
  return useQuery<LanguageRecord[]>({
    queryKey: ["languages", uid],
    enabled,
    queryFn: () => (DEMO_MODE ? [] : languageService.list(uid!)),
  });
}

export function useMistakes() {
  const { uid, enabled } = useUid();
  return useQuery<MistakeRecord[]>({
    queryKey: ["mistakes", uid],
    enabled,
    queryFn: () => (DEMO_MODE ? [] : mistakeService.list(uid!)),
  });
}

export function useStudyNotes() {
  const { uid, enabled } = useUid();
  return useQuery<StudyNoteRecord[]>({
    queryKey: ["study_notes", uid],
    enabled,
    queryFn: () => (DEMO_MODE ? [] : studyNoteService.list(uid!)),
  });
}

export function useProgress() {
  const { uid, enabled } = useUid();
  return useQuery<ProgressRecord[]>({
    queryKey: ["progress", uid],
    enabled,
    queryFn: () => (DEMO_MODE ? [] : progressService.list(uid!)),
  });
}

export function useVocabulary() {
  const { uid, enabled } = useUid();
  return useQuery<VocabularyRecord[]>({
    queryKey: ["vocabulary", uid],
    enabled,
    queryFn: () => (DEMO_MODE ? [] : vocabularyService.list(uid!)),
  });
}
