export interface Contact {
  _id: string;
  name: string;
  phone: string;
  message: string;
  answer: string;
  isAnswered: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ContactListResponse {
  success: boolean;
  count: number;
  pagination: ContactPagination;
  data: Contact[];
}

export interface ContactPublicationResponse {
  success: boolean;
  data: {
    id: string;
    isAnswered: boolean;
    isPublic: boolean;
  };
}

export interface ContactDeleteResponse {
  success: boolean;
  message: string;
  data: Contact;
}

export interface ClearContactsResponse {
  success: boolean;
  message: string;
  deletedCount: number;
}
