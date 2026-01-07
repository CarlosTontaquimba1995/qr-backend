export interface UserPayload {
  user?: {
    id: string;
    role: string;
    [key: string]: any;
  };
  id?: string;
  role?: string;
  [key: string]: any;
}
