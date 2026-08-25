import { Outlet } from "react-router";

import CustomHeader from "@/users/components/CustomHeader";

const UsersLayout = () => (
  <div className="relative min-h-screen bg-background">
    <div className="ms-page-grid pointer-events-none fixed inset-0 opacity-30" />
    <CustomHeader />
    <div className="relative">
      <Outlet />
    </div>
  </div>
);

export default UsersLayout;
