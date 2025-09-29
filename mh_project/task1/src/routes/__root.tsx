import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <div className="bg-gray-50 rounded-lg p-6 container mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Quick Navigation</h2>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link
            to='/'
            activeProps={{
              className: 'font-bold',
            }}
            activeOptions={{ exact: true }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Home
          </Link>
          <Link
            to='/faq'
            activeProps={{
              className: 'font-bold',
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Faq
          </Link>
          <Link
            to='/footer'
            activeProps={{
              className: 'font-bold',
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Footer
          </Link>
          <Link
            to='/getInTouch'
            activeProps={{
              className: 'font-bold',
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Get In Touch
          </Link>
        </nav>
      </div>
      <Outlet />
    </>
  )
}
