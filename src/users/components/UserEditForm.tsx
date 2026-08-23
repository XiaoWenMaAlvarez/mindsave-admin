import { Button } from "@/components/ui/button";
import type { UserResponse } from "../interfaces/UserResponse.interface";
import { useForm } from "react-hook-form"
import { Link } from "react-router";
import { SaveAll, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  email: string,
  name: string,
  password: string,
  emailVerified: boolean,
  role: "PROFESIONAL_ROL" | "USER_ROLE",

  isPending: boolean,
  onSubmit: (userEdit: Partial<UserResponse>) => Promise<void>
}

const UserEditForm = ({email, name, password, emailVerified, role, isPending, onSubmit} : Props) => {

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email,
      name,
      password,
      emailVerified,
      role
    }
  });


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex justify-between items-center">
        <h1>Edición de usuario</h1>
        <div className="flex justify-end mb-10 gap-4">
          <Button variant="outline" type="button">
            <Link to="/admin/products" className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Link>
          </Button>

          <Button type="submit" disabled={isPending}>
            <SaveAll className="w-4 h-4" />
            Guardar cambios
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Datos del usuario
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre del usuario
                  </label>
                  <input
                    type="text"
                    {...register('name', {
                      required: true,
                      minLength: 2,
                      maxLength: 30
                    })}
                    className={cn(
                      'w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
                      {
                        'border-red-500': errors.name,
                      }
                    )}
                    placeholder="Nombre del usuario"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      El nombre es requerido
                    </p>
                  )}
                </div>



                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rol del usuario
                  </label>
                  <select
                    {...register('role')}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="PROFESIONAL_ROL">Administrador</option>
                    <option value="USER_ROL">Usuario</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                  type="email"
                    {...register('email', { required: true })}
                    className={cn(
                      'w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
                      {
                        'border-red-500': errors.email,
                      }
                    )}
                    placeholder="Correo electrónico"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {'El email es requerido.'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contraseña
                  </label>
                  <input
                  type="password"
                    {...register('password', { required: true, minLength: 4, maxLength: 20 })}
                    className={cn(
                      'w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
                      {
                        'border-red-500': errors.password,
                      }
                    )}
                    placeholder="Contraseña"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {'La contraseña es requerida.'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Verificación del correo electrónico
                  </label>
                  <input type="checkbox" {...register("emailVerified")} />
                </div>


              </div>
            </div>



          </div>

        </div>
      </div>
    </form>
  );

}

export default UserEditForm;