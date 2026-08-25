export interface UserResponse {
  id: string,
  email: string,
  name: string,
  password: string,
  emailVerified: boolean,
  role: "PROFESIONAL_ROL" | "USER_ROL",
  isActive: boolean
}