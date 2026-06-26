import type { ProjectData } from '@admin/interfaces/project.interface';
import api from '../../api/axios';

export const projectService = {
  getAll: () => api.get<{ data: ProjectData[] }>('/projects'),
  create: (data: FormData) => api.post('/projects', data),
  update: (id: string, data: Partial<ProjectData>) =>
    api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};
