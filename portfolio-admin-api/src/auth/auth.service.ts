import bcrypt from "bcrypt";
import { findAdminUserByEmail, updateAdminLastLoginAt } from "./auth.repository";

export async function loginAdmin(params: { email: string; password: string }) {
  const { email, password } = params;

  const user = await findAdminUserByEmail(email);

  if (!user || user.is_active !== 1) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  await updateAdminLastLoginAt(user.id);

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
  };
}