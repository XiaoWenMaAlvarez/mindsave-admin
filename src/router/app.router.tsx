import { createBrowserRouter, Navigate } from "react-router";
import { HomePage, UsersPage, UserPage, NewUserPage } from "@/users/pages/init.js";
import UsersLayout from "@/users/layout/UsersLayout.js";
import {LoginPage} from "@/auth/pages/LoginPage.jsx";
import { AuthenticatedRoute, NotAuthenticatedRoute } from "@/components/routes/ProtectedRoutes.js";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthenticatedRoute>
        <UsersLayout />
      </AuthenticatedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "users/:id",
        element: <UserPage />,
      },
      {
        path: "new-user",
        element: <NewUserPage />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <NotAuthenticatedRoute>
        <LoginPage />
      </NotAuthenticatedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);
