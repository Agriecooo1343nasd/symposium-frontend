import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CreatePollDto,
  CreateSessionMessageDto,
  CreateSessionQuestionDto,
  CreateSessionRatingDto,
  ModerateSessionQuestionDto,
  SessionMessageDto,
  SessionPollDto,
  SessionQuestionDto,
  SessionRatingDto,
  VotePollDto,
} from "../dto";

export const engagementService = {
  listQuestions(sessionId: string) {
    return apiClient
      .get<ApiResponse<SessionQuestionDto[]>>(`/sessions/${sessionId}/questions`)
      .then(unwrapApi);
  },
  askQuestion(sessionId: string, dto: CreateSessionQuestionDto) {
    return apiClient
      .post<ApiResponse<SessionQuestionDto>>(`/sessions/${sessionId}/questions`, dto)
      .then(unwrapApi);
  },
  moderateQuestion(sessionId: string, questionId: string, dto: ModerateSessionQuestionDto) {
    return apiClient
      .patch<ApiResponse<SessionQuestionDto>>(`/sessions/${sessionId}/questions/${questionId}`, dto)
      .then(unwrapApi);
  },
  listPolls(sessionId: string) {
    return apiClient
      .get<ApiResponse<SessionPollDto[]>>(`/sessions/${sessionId}/polls`)
      .then(unwrapApi);
  },
  createPoll(sessionId: string, dto: CreatePollDto) {
    return apiClient
      .post<ApiResponse<SessionPollDto>>(`/sessions/${sessionId}/polls`, dto)
      .then(unwrapApi);
  },
  votePoll(pollId: string, dto: VotePollDto) {
    return apiClient.post<ApiResponse<SessionPollDto>>(`/polls/${pollId}/vote`, dto).then(unwrapApi);
  },
  rateSession(sessionId: string, dto: CreateSessionRatingDto) {
    return apiClient
      .post<ApiResponse<SessionRatingDto>>(`/sessions/${sessionId}/ratings`, dto)
      .then(unwrapApi);
  },
  listMessages(sessionId: string) {
    return apiClient
      .get<ApiResponse<SessionMessageDto[]>>(`/sessions/${sessionId}/messages`)
      .then(unwrapApi);
  },
  sendMessage(sessionId: string, dto: CreateSessionMessageDto) {
    return apiClient
      .post<ApiResponse<SessionMessageDto>>(`/sessions/${sessionId}/messages`, dto)
      .then(unwrapApi);
  },
};
