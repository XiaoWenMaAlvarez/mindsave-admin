export interface NewUser {
  email: string,
  name: string,
  password: string,
  emailVerified: boolean,
  role: "PROFESIONAL_ROL" | "USER_ROL",
}