import api from './axiosConfig';

export const getAllQuestions = () => api.get('/question/allQuestions');
export const getQuestionsByCategory = (category) => api.get(`/question/Category/${category}`);
export const addQuestion = (question) => api.post('/question/add', question);
export const updateQuestion = (id, question) => api.put(`/question/update/${id}`, question);
export const deleteQuestion = (id) => api.delete(`/question/delete/${id}`);
export const getCategorySummary = () => api.get('/question/categorySummary');
export const generateQuestions = (topic, difficulty, count) =>
  api.get('/question/generate', { params: { topic, difficulty, count } });
export const getPagedQuestions = (category, difficulty, page = 0, size = 10) =>
  api.get('/question/paged', { params: { category, difficulty, page, size } });
export const getMyQuestions = (page = 0, size = 10) =>
  api.get('/question/my', { params: { page, size } });
