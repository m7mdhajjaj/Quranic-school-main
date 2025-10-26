export interface Activity {
  _id?: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  imagePublicId?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityFormData {
  _id?: string;
  title: string;
  description: string;
  date: string;
  image: string;
  category: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  role: string;
  groups?: string[];
}

