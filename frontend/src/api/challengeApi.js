import api from './axiosConfig';

export const createChallenge = (quizId, attemptId) =>
  api.post('/challenge/create', null, { params: { quizId, attemptId } });

export const getChallengeInfo = (token) => api.get(`/challenge/${token}`);

export const completeChallenge = (token, attemptId) =>
  api.post(`/challenge/${token}/complete`, null, { params: { attemptId } });

export const getChallengeResult = (token) => api.get(`/challenge/${token}/result`);