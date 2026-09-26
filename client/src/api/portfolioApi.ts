import axios from 'axios';
import type {
  About,
  ContactAnswer,
  ContactInput,
  ContactReceipt,
  Envelope,
  Faq,
  ProjectList,
} from '../types/portfolio';

// Public requests do not need the administrator's session cookie.
const api = axios.create({
  baseURL: import.meta.env.DEV
    ? '/api'
    : import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
      'https://api.asilbek-karomatov.dev/api',
  withCredentials: false,
  timeout: 20000,
  headers: { Accept: 'application/json' },
});
export const portfolioApi = {
  async about(signal?: AbortSignal) {
    return (await api.get<Envelope<About | null>>('/about', { signal })).data
      .data;
  },
  async projects(page = 1, signal?: AbortSignal) {
    return (
      await api.get<ProjectList>('/projects', {
        params: { page, limit: 2 },
        signal,
      })
    ).data;
  },
  async faq(signal?: AbortSignal) {
    return (await api.get<Envelope<Faq[]>>('/faq', { signal })).data.data;
  },
  async contact(input: ContactInput, recaptchaToken: string) {
    return (
      await api.post<Envelope<ContactReceipt>>('/contact', {
        ...input,
        recaptchaToken,
      })
    ).data.data;
  },
  async answer(token: string) {
    return (
      await api.get<Envelope<ContactAnswer>>(
        `/contact/answer/${encodeURIComponent(token)}`,
      )
    ).data.data;
  },
};
export function apiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429)
      return 'So‘rovlar limiti tugadi. Birozdan keyin qayta urinib ko‘ring.';
    if (typeof error.response?.data?.message === 'string')
      return error.response.data.message;
  }
  return 'Ulanishda xatolik yuz berdi. Qayta urinib ko‘ring.';
}
