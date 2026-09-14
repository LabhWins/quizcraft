import api from './axiosConfig';

export const createQuiz = (category, difficulty, numQ, title) =>
  api.post('/quiz/create', null, { params: { category, difficulty, numQ, title } });
export const getQuizQuestions = (id) => api.get(`/quiz/get/${id}`);
export const submitQuiz = (id, playerName, playerEmail, responses) =>
  api.post(`/quiz/submit/${id}`, { playerName, playerEmail, responses });
export const getHistory = () => api.get('/quiz/history');
export const getMyHistory = () => api.get('/quiz/my-history'); 
export const getAttempt = (attemptId) => api.get(`/quiz/attempt/${attemptId}`);
