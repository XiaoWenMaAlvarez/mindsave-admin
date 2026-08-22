
const ErrorPage = ({error}: {error: string}) => {
  return <h1 className="text-red-500">Error en la página: { error }</h1>
}

export default ErrorPage;
