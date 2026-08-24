import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserAction } from "../actions/createUser.action";
import type { NewUser } from "../interfaces/NewUser.interface";


export const useCreateUser = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newUser: NewUser) => createUserAction(newUser),

    onSuccess: (newUser) => {
      if(newUser) {
        queryClient.invalidateQueries({queryKey: ["users"]});
      }
    }
  });

}
