export interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubLink: string;
  demoLink?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  technologies: string[];
  githubLink: string;
  demoLink?: string;
  image?: File | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
