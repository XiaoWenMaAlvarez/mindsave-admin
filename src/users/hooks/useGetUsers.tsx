import { useQuery } from "@tanstack/react-query";
import { getAllUsersByPageAction, type GetAllUsersByPageParams } from "../actions/getAllUserByPage.action";
import { useSearchParams } from "react-router";


export const useGetUsers = () => {
  const [searchParams] = useSearchParams();

  let page = Number(searchParams.get('page') ?? "1");
  let limit = Number(searchParams.get('limit') ?? "10");

  const query = searchParams.get('query') ?? "";
  const rol = searchParams.get('rol') ?? "";
  const state = searchParams.get('state') ?? "";
  const emailVerify = searchParams.get('emailVerify') ?? "";

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  const params = {} as GetAllUsersByPageParams

  params.page = page;
  params.limit = limit;
  if(query.trim() !== "") params.query = query;
  if(rol !== "") params.rol = rol;
  if(state !== "") params.state = state;
  if(emailVerify !== "") params.emailVerify = emailVerify;

  return useQuery({
    queryKey: ['users', {page, limit, query, rol, state, emailVerify}],
    queryFn: () => getAllUsersByPageAction(params),
  });

}
