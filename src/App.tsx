import { RouterProvider } from 'react-router'
import './App.css'
import { appRouter } from './router/app.router'

function App() {
  return (
    <div className='min-h-screen bg-slate-100'>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App
