import { useAuthStore } from "@/auth/store/auth.store";


const HomePage = () => {

  const { user } = useAuthStore();

  return (
    <h1>Bienvenido {user?.name}</h1>
  )
}

export default HomePage;