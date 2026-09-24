export interface About {
  _id: string;
  fullName: string;
  title: string;
  avatar: string;
  bio: string;
  experienceYears: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutFormValues {
  fullName: string;
  title: string;
  bio: string;
  experienceYears: string;
}

export interface AboutResponse {
  success: boolean;
  message?: string;
  data: About;
}

export type AboutStatus = 'loading' | 'ready' | 'empty' | 'error';
