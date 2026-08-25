export interface CheckAuthResponse {
  id: string,
  email: string,
  name: string,
  role: "PROFESIONAL_ROL" | "USER_ROL",
  token: string,
}