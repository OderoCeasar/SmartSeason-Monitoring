import { apiClient } from './client';

export async function getFields(params = {}) {
  const response = await apiClient.get('/fields', { params });
  return response.data;
}

export async function getFieldById(fieldId) {
  const response = await apiClient.get(`/fields/${fieldId}`);
  return response.data;
}

export async function createField(payload) {
  const response = await apiClient.post('/fields', payload);
  return response.data;
}

export async function updateField(fieldId, payload) {
  const response = await apiClient.patch(`/fields/${fieldId}`, payload);
  return response.data;
}

export async function deleteField(fieldId) {
  const response = await apiClient.delete(`/fields/${fieldId}`);
  return response.data;
}

export async function assignField(fieldId, payload) {
  const response = await apiClient.post(`/fields/${fieldId}/assign`, payload);
  return response.data;
}

export async function getUsers(params = {}) {
  const response = await apiClient.get('/users', { params });
  return response.data;
}
