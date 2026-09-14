import api from './axiosConfig';

export const createRoom = (category, difficulty, numQ, hostName) =>
    api.post('/multiplayer/create', null, { params: { category, difficulty, numQ, hostName } });

export const getRoomInfo = (code) => api.get(`/multiplayer/${code}`);   

export const getMultiplayerResults = (code) => api.get(`/multiplayer/${code}/results`);