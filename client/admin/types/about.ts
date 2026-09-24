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

export interface AboutResponse {
  success: boolean;
  data: About;
}
