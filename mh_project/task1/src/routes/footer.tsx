import { createFileRoute } from '@tanstack/react-router'
import { Facebook, Linkedin, Twitter, Instagram } from 'lucide-react'

export const Route = createFileRoute('/footer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <main className='container mx-auto mt-10'>
    <footer className="py-12 px-4 max-w-[1360px] mx-auto min-h-[456px] mt-[110px]">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Business Logo & Info */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h3 className="font-Inter font-bold text-[20px] leading-[28px] tracking-[-0.03em] sm:text-[20px] sm:leading-[28px] sm:tracking-[-0.03em] md:text-[32px] md:leading-[100%] md:tracking-[-0.03em] lg:text-[32px] lg:leading-[100%] lg:tracking-[-0.03em]">Business Logo</h3>
              {/* Social Media Links */}
              <div className="flex space-x-4 mt-[20px] md:mt-[35px]">
                <a href="#" className=" hover: transition-colors">
                  <Facebook size={20} fill={'20px'} />
                </a>
                <a href="#" className=" hover: transition-colors">
                  <Linkedin size={20} fill={'20px'} />
                </a>
                <a href="#" className=" hover: transition-colors">
                  <Twitter size={20} fill={'20px'} />
                </a>
                <a href="#" className=" hover: transition-colors">
                  <Instagram size={20}  />
                </a>
              </div>
            </div>
          </div>

          {/* Our Services */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold mb-4 ">Our Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className=" text-sm">Plumbing</a></li>
              <li><a href="#" className=" text-sm">Drainage</a></li>
              <li><a href="#" className=" text-sm">Bathrooms</a></li>
              <li><a href="#" className=" text-sm">Commercial</a></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div className="">
            <h4 className="text-lg font-semibold mb-4 ">Useful Links</h4>
            <div className="grid grid-cols-2 gap-x-6">
              <ul className="space-y-2">
                <li><a href="#" className=" text-sm">Contact Us</a></li>
                <li><a href="#" className=" text-sm">Updates</a></li>
                <li><a href="#" className=" text-sm">About Us</a></li>
                <li><a href="#" className=" text-sm">Locations</a></li>
              </ul>
              <ul className="space-y-2">
                <li><a href="#" className=" text-sm">Customer Services</a></li>
                <li><a href="#" className=" text-sm">Updates</a></li>
                <li><a href="#" className=" text-sm">Rates</a></li>
                <li><a href="#" className=" text-sm">Sitemap</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold mb-4 ">Contact Info</h4>
            <div className="space-y-3 font-semibold">
              <div>
                <span className="text-sm">1 Sail Street, London, SE11 6NQ</span>
              </div>
              <div>
                <a href="mailto:enquiries@PlumbingPros.com" className="text-sm">
                  enquiries@PlumbingPros.com
                </a>
              </div>
              <div>
                <a href="tel:02045276474" className="text-sm">
                  020 4527 6474
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-[35px] md:pt-[45px] lg:pt-[80px] ">
          <div className="fle x flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className=" text-sm text-center md:text-left">
              © Plumbing Pros. All Rights Reserved
            </div>
            <div className=" text-sm text-center md:text-right">
              Website by IH Adventure And Creative
            </div>
          </div>
        </div>
      </div>
    </footer>
  </main>
}
