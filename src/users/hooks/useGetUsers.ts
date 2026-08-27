import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getAllUsersByPageAction, type GetAllUsersByPageParams } from "../actions/getAllUserByPage.action";

const ALLOWED_ROLES = new Set(["USER_ROL", "PROFESIONAL_ROL"]);
const ALLOWED_STATES = new Set(["active", "inactive"]);
const ALLOWED_EMAIL_VERIFY = new Set(["verify", "unverify"]);

const parsePositiveInteger = (value: string | null, defaultValue: number, max?: number): number => {
  if (!value) return defaultValue;
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1) {
    return defaultValue;
  }
  if (max !== undefined && num > max) {
    return max;
  }
  return num;
};

export const useGetUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parsePositiveInteger(searchParams.get("page"), 1);
  const limit = parsePositiveInteger(searchParams.get("limit"), 10, 100);

  const rawQuery = searchParams.get("query") ?? "";
  const query = rawQuery.trim().slice(0, 100);

  const rawRol = searchParams.get("rol") ?? "";
  const rol = ALLOWED_ROLES.has(rawRol) ? rawRol : "";

  const rawState = searchParams.get("state") ?? "";
  const state = ALLOWED_STATES.has(rawState) ? rawState : "";

  const rawEmailVerify = searchParams.get("emailVerify") ?? "";
  const emailVerify = ALLOWED_EMAIL_VERIFY.has(rawEmailVerify) ? rawEmailVerify : "";

  const params: GetAllUsersByPageParams = {
    page,
    limit,
  };

  if (query) params.query = query;
  if (rol) params.rol = rol;
  if (state) params.state = state;
  if (emailVerify) params.emailVerify = emailVerify;

  const result = useQuery({
    queryKey: ["users", { page, limit, query, rol, state, emailVerify }],
    queryFn: () => getAllUsersByPageAction(params),
  });

  useEffect(() => {
    if (result.data && result.data.totalPages > 0 && page > result.data.totalPages) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(result.data.totalPages));
        return next;
      }, { replace: true });
    }
  }, [result.data, page, setSearchParams]);

  return result;
};
