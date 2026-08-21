import type { UserResponse } from "./UserResponse.interface";

export interface UsersResponse {
  results: UserResponse[],
  totalPages: number;
  page: number;
  limit: number;
}