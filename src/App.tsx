import type { PropsWithChildren } from "react";
import { AlertCircle, CheckCircle2, Info, LoaderCircle, TriangleAlert } from "lucide-react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";

import { useAuthStore } from "@/auth/store/auth.store";
import LoadingPage from "@/components/shared/LoadingPage";
import { appRouter } from "@/router/app.router";

const queryClient = new QueryClient();

const CheckAuthProvider = ({ children }: PropsWithChildren) => {
  const { checkAuthStatus } = useAuthStore();

  const { isLoading } = useQuery({
    queryKey: ["auth"],
    queryFn: checkAuthStatus,
    retry: false,
    refetchInterval: 1000 * 60 * 60 * 1.5,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <LoadingPage message="Comprobando tu sesión" />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster
      theme="dark"
      position="top-right"
      richColors
      closeButton
      visibleToasts={4}
      gap={10}
      offset={{ top: 76, right: 18 }}
      mobileOffset={{ top: 72, right: 12, left: 12 }}
      containerAriaLabel="Notificaciones"
      icons={{
        success: <CheckCircle2 className="size-4" />,
        error: <AlertCircle className="size-4" />,
        info: <Info className="size-4" />,
        warning: <TriangleAlert className="size-4" />,
        loading: <LoaderCircle className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !border-border !bg-card !text-foreground !shadow-2xl",
          title: "!font-sans !font-semibold",
          description: "!text-muted-foreground",
          closeButton: "!border-border !bg-secondary !text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
        },
      }}
    />
    <CheckAuthProvider>
      <RouterProvider router={appRouter} />
    </CheckAuthProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;
