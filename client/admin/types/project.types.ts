export interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubLink: string;
  demoLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFormValues {
  title: string;
  description: string;
  technologies: string[];
  githubLink: string;
  demoLink?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProjectListResponse {
  success: boolean;
  count: number;
  pagination: PaginationMeta;
  data: Project[];
}

export interface ProjectResponse {
  success: boolean;
  message?: string;
  data: Project;
}
