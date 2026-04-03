export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  role: "user" | "admin";
}
