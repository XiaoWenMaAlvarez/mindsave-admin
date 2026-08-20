import { createBrowserRouter } from "react-router";
import UsersPage from "@/users/page/UsersPage";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <UsersPage />,
  },
  {
    path: "*",
    element: <h1>Página no encontrada</h1>
  }
]);