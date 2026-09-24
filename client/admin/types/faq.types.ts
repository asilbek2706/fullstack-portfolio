export interface Faq {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface FaqFormValues {
  question: string;
  answer: string;
}

export interface FaqListResponse {
  success: boolean;
  count: number;
  data: Faq[];
}

export interface FaqMutationResponse {
  success: boolean;
  message: string;
  data: Faq;
}

export interface FaqDeleteResponse {
  success: boolean;
  message: string;
}
