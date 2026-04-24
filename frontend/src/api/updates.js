import { apiClient } from './client';

export async function getFieldUpdates(fieldId, params = {}) {
  const response = await apiClient.get(`/fields/${fieldId}/updates`, { params });
  return response.data;
}

export async function createFieldUpdate(fieldId, payload) {
  const response = await apiClient.post(`/fields/${fieldId}/updates`, payload);
  return response.data;
}
