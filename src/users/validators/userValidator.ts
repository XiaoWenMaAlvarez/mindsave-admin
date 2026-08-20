import * as z from 'zod/v4';

const UserSchema = z.object({
  id: z.string().optional(),
  email: z.email(),
  name: z.string(),
  password: z.string(),
  emailVerified: z.boolean(),
  role: z.enum(["PROFESIONAL_ROL", "USER_ROLE"]),
  isActive: z.boolean()
})

export default UserSchema