import { http } from '../../shared/api/http';
import type {
  Project,
  ProjectFormValues,
  ProjectListResponse,
  ProjectResponse,
} from '../types/project.types';

interface GetProjectsOptions {
  page?: number;
  limit?: number;
}

interface ProjectMutationInput {
  values: ProjectFormValues;
  image?: File;
}

interface UpdateProjectInput extends ProjectMutationInput {
  id: string;
}

const appendProjectFields = (formData: FormData, values: ProjectFormValues) => {
  formData.append('title', values.title.trim());
  formData.append('description', values.description.trim());
  formData.append(
    'technologies',
    JSON.stringify(values.technologies.map((technology) => technology.trim())),
  );
  formData.append('githubLink', values.githubLink.trim());

  const demoLink = values.demoLink?.trim();

  if (demoLink) {
    formData.append('demoLink', demoLink);
  }
};

export const projectApi = {
  async getAll({
    page = 1,
    limit = 12,
  }: GetProjectsOptions = {}): Promise<ProjectListResponse> {
    const response = await http.get<ProjectListResponse>('/projects', {
      params: {
        page,
        limit,
      },
    });

    return response.data;
  },

  async getById(id: string): Promise<Project> {
    const response = await http.get<ProjectResponse>(`/projects/${id}`);

    return response.data.data;
  },

  async create({ values, image }: ProjectMutationInput): Promise<Project> {
    const formData = new FormData();

    appendProjectFields(formData, values);

    if (image) {
      formData.append('image', image);
    }

    const response = await http.post<ProjectResponse>('/projects', formData);

    return response.data.data;
  },

  async update({ id, values, image }: UpdateProjectInput): Promise<Project> {
    const formData = new FormData();

    appendProjectFields(formData, values);

    if (image) {
      formData.append('image', image);
    }

    const response = await http.put<ProjectResponse>(
      `/projects/${id}`,
      formData,
    );

    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/projects/${id}`);
  },
};
