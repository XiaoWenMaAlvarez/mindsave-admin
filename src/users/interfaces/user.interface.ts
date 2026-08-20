export interface User {
    id: string,
    email: string,
    name: string,
    password: string,
    emailVerified: boolean,
    role: "PROFESIONAL_ROL" | "USER_ROLE",
    isActive: boolean
}