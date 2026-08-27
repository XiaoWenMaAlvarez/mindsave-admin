import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AuthenticatedRoute, NotAuthenticatedRoute } from "@/components/routes/ProtectedRoutes";
import LoadingPage from "@/components/shared/LoadingPage";

const HomePage = lazy(() => import("@/users/pages/HomePage"));
const UsersPage = lazy(() => import("@/users/pages/UsersPage"));
const UserPage = lazy(() => import("@/users/pages/UserPage"));
const NewUserPage = lazy(() => import("@/users/pages/NewUserPage"));
const UsersLayout = lazy(() => import("@/users/layout/UsersLayout"));
const LoginPage = lazy(() =>
  import("@/auth/pages/LoginPage").then((module) => ({ default: module.LoginPage }))
);

const withSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<LoadingPage />}>{Component}</Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthenticatedRoute>
        {withSuspense(<UsersLayout />)}
      </AuthenticatedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(<HomePage />),
      },
      {
        path: "users",
        element: withSuspense(<UsersPage />),
      },
      {
        path: "users/:id",
        element: withSuspense(<UserPage />),
      },
      {
        path: "new-user",
        element: withSuspense(<NewUserPage />),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <NotAuthenticatedRoute>
        {withSuspense(<LoginPage />)}
      </NotAuthenticatedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;

