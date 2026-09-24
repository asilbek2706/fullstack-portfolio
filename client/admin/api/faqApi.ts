import { http } from '../../shared/api/http';
import type {
  Faq,
  FaqDeleteResponse,
  FaqFormValues,
  FaqListResponse,
  FaqMutationResponse,
} from '../types/faq.types';

const normalizeValues = (values: FaqFormValues): FaqFormValues => ({
  question: values.question.trim(),
  answer: values.answer.trim(),
});

export const faqApi = {
  async getAll(): Promise<FaqListResponse> {
    const response = await http.get<FaqListResponse>('/faq');

    return response.data;
  },

  async create(values: FaqFormValues): Promise<Faq> {
    const response = await http.post<FaqMutationResponse>(
      '/faq',
      normalizeValues(values),
    );

    return response.data.data;
  },

  async update(id: string, values: FaqFormValues): Promise<Faq> {
    const response = await http.put<FaqMutationResponse>(
      `/faq/${id}`,
      normalizeValues(values),
    );

    return response.data.data;
  },

  async remove(id: string): Promise<FaqDeleteResponse> {
    const response = await http.delete<FaqDeleteResponse>(`/faq/${id}`);

    return response.data;
  },
};
