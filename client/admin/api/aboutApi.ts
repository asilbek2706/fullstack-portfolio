import { http } from '../../shared/api/http';
import type { AboutFormValues, AboutResponse } from '../types/about.types';

interface UpdateAboutInput {
  values: AboutFormValues;
  avatar?: File;
}

export const aboutApi = {
  async get() {
    const response = await http.get<AboutResponse>('/about');

    return response.data.data;
  },

  async update({ values, avatar }: UpdateAboutInput) {
    const formData = new FormData();

    formData.append('fullName', values.fullName.trim());
    formData.append('title', values.title.trim());
    formData.append('bio', values.bio.trim());
    formData.append('experienceYears', values.experienceYears.trim());

    if (avatar) {
      formData.append('avatar', avatar);
    }

    const response = await http.put<AboutResponse>('/about', formData);

    return response.data.data;
  },
};
