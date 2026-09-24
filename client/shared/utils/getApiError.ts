import axios from 'axios';

type ErrorResponse = {
  message?: string;
};

export const getApiError = (
  error: unknown,
  fallback = 'Kutilmagan xatolik yuz berdi.',
) => {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
