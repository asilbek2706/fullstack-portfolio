export interface AboutData {
  _id: string;
  fullName: string;
  title: string;
  avatar: string;
  bio: string;
  experienceYears: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// API dan keladigan umumiy javob uchun
export interface AboutResponse {
  success: boolean;
  data: AboutData;
}
