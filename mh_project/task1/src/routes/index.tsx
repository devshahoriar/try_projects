import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { Home, HelpCircle, Users } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <main className="container mx-auto p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to PlumbingPros</h1>
      
      {/* 3 Box Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Box 1 - FAQ */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center border hover:shadow-xl transition-shadow">
          <div className="mb-4 flex justify-center">
            <HelpCircle size={48} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4">FAQ</h3>
          <Button asChild className="w-full">
            <Link to="/faq">View FAQ</Link>
          </Button>
        </div>

        {/* Box 2 - Footer */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center border hover:shadow-xl transition-shadow">
          <div className="mb-4 flex justify-center">
            <Users size={48} className="text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Footer Information</h3>
          <Button asChild className="w-full">
            <Link to="/footer">View Footer</Link>
          </Button>
        </div>

        {/* Box 3 - Get In Touch */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center border hover:shadow-xl transition-shadow">
          <div className="mb-4 flex justify-center">
            <Home size={48} className="text-orange-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Get In Touch</h3>
          <Button asChild className="w-full">
            <Link to="/getInTouch">Contact Us</Link>
          </Button>
        </div>
      </div>

      {/* Navigation Links */}
      
    </div>
  </main>
}
