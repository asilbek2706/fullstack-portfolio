import axios from 'axios';
import type { Project, ProjectFormData } from '../interfaces/project.interface';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const getProjects = async () => {
  const { data } = await API.get('/projects');
  return data.data as Project[];
};

export const getProjectById = async (id: string) => {
  const { data } = await API.get(`/projects/${id}`);
  return data.data as Project;
};

// ======================
// CREATE
// ======================

export const createProject = async (project: ProjectFormData) => {
  const formData = new FormData();

  formData.append('title', project.title);
  formData.append('description', project.description);

  project.technologies.forEach((tech) => {
    formData.append('technologies', tech);
  });

  formData.append('githubLink', project.githubLink);

  if (project.demoLink) {
    formData.append('demoLink', project.demoLink);
  }

  if (project.image) {
    formData.append('image', project.image);
  }

  const { data } = await API.post('/projects', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.data;
};

// ======================
// UPDATE (PUT)
// ======================

export const updateProject = async (id: string, project: ProjectFormData) => {
  const formData = new FormData();

  formData.append('title', project.title);
  formData.append('description', project.description);

  project.technologies.forEach((tech) => {
    formData.append('technologies', tech);
  });

  formData.append('githubLink', project.githubLink);

  if (project.demoLink) {
    formData.append('demoLink', project.demoLink);
  }

  if (project.image) {
    formData.append('image', project.image);
  }

  const { data } = await API.put(`/projects/${id}`, formData);

  return data.data as Project;
};

// ======================
// PATCH
// ======================

export const patchProject = async (
  id: string,
  project: Partial<ProjectFormData>,
) => {
  const formData = new FormData();

  if (project.title) {
    formData.append('title', project.title);
  }

  if (project.description) {
    formData.append('description', project.description);
  }

  if (project.technologies) {
    project.technologies.forEach((tech) => {
      formData.append('technologies', tech);
    });
  }

  if (project.githubLink) {
    formData.append('githubLink', project.githubLink);
  }

  if (project.demoLink) {
    formData.append('demoLink', project.demoLink);
  }

  if (project.image) {
    formData.append('image', project.image);
  }

  const { data } = await API.patch(`/projects/${id}`, formData);

  return data.data as Project;
};

// ======================
// DELETE
// ======================

export const deleteProject = async (id: string) => {
  const { data } = await API.delete(`/projects/${id}`);
  return data.message;
};
