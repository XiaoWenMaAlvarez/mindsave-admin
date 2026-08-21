import { Outlet } from "react-router";
import CustomHeader from "@/users/components/CustomHeader.jsx";

const UsersLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <CustomHeader />
      <Outlet />
    </div>
  )
}

export default UsersLayout;