export interface LoginResponse {
  id: string,
  email: string,
  name: string,
  role: "PROFESIONAL_ROL" | "USER_ROLE",
  token: string,
}