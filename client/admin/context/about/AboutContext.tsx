import { createContext } from 'react';
import type {
  About,
  AboutFormValues,
  AboutStatus,
} from '../../types/about.types';

interface SaveAboutInput {
  values: AboutFormValues;
  avatar?: File;
}

export interface AboutContextValue {
  about: About | null;
  status: AboutStatus;
  errorMessage: string;
  saving: boolean;
  refreshAbout: () => Promise<void>;
  saveAbout: (input: SaveAboutInput) => Promise<About>;
}

export const AboutContext = createContext<AboutContextValue | null>(null);
