import api from './api';

export interface SystemConfig {
    key: string;
    value: string;
    description: string;
}

export const systemConfigService = {
  getAllConfigs: async () => {
    const response = await api.get<SystemConfig[]>('/config');
    return response.data;
  },

  updateConfig: async (key: string, value: string) => {
    const response = await api.put<SystemConfig>(`/config/${key}`, { value });
    return response.data;
  }
};
