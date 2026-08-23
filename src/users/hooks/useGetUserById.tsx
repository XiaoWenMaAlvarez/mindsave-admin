import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserByIdAction } from "../actions/getUserByID.action";
import { editUserAction } from "../actions/editUser.action";

export const useGetUserById = (id: string) => {

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user', {id}],
    queryFn: () => getUserByIdAction(id),
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: !!id
  });

  const mutation = useMutation({
    mutationFn: editUserAction,

    onSuccess: (id: string | null) => {
      if(id) {
        queryClient.invalidateQueries({queryKey: ["users"]});
        queryClient.invalidateQueries({queryKey: ["user", {id: id}]});
      }      
    }
  });

  return {
    ...query,
    mutation
  }

}
