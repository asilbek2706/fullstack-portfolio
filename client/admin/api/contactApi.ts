import { http } from '../../shared/api/http';
import type {
  ClearContactsResponse,
  ContactDeleteResponse,
  ContactListResponse,
  ContactPublicationResponse,
} from '../types/contact.types';

interface GetContactsOptions {
  page?: number;
  limit?: number;
}

interface ClearContactsInput {
  confirmation: 'DELETE_ALL_CONTACTS';
  password: string;
}

export const contactApi = {
  async create(input: {
    name: string;
    phone: string;
    message: string;
    recaptchaToken: string;
  }): Promise<void> {
    await http.post('/contact', {
      name: input.name,
      phone: input.phone,
      message: input.message,
      recaptchaToken: input.recaptchaToken,
    });
  },

  async getAll({
    page = 1,
    limit = 20,
  }: GetContactsOptions = {}): Promise<ContactListResponse> {
    const response = await http.get<ContactListResponse>('/contact', {
      params: {
        page,
        limit,
      },
    });

    return response.data;
  },

  async setPublication(
    id: string,
    isPublic: boolean,
  ): Promise<ContactPublicationResponse> {
    const response = await http.patch<ContactPublicationResponse>(
      `/contact/${id}/publication`,
      {
        isPublic,
      },
    );

    return response.data;
  },

  async remove(id: string): Promise<ContactDeleteResponse> {
    const response = await http.delete<ContactDeleteResponse>(
      `/contact/clear/${id}`,
    );

    return response.data;
  },

  async clearAll(input: ClearContactsInput): Promise<ClearContactsResponse> {
    const response = await http.delete<ClearContactsResponse>(
      '/contact/clear',
      {
        data: input,
      },
    );

    return response.data;
  },
};
