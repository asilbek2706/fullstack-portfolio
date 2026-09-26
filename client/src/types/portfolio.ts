export interface About {
  _id: string;
  fullName: string;
  title: string;
  avatar: string;
  bio: string;
  experienceYears: string;
}
export interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubLink: string;
  demoLink?: string;
}
export interface Faq {
  _id: string;
  question: string;
  answer: string;
}
export interface Envelope<T> {
  success: boolean;
  data: T;
}
export interface ProjectList extends Envelope<Project[]> {
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
  };
}
export interface ContactInput {
  name: string;
  phone: string;
  message: string;
}
export interface ContactReceipt {
  trackingToken: string;
  deliveryStatus: 'sent' | 'failed';
}
export interface ContactAnswer {
  isAnswered: boolean;
  answer: string;
  updatedAt: string;
}
