import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'

export const Route = createFileRoute('/getInTouch')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className='container mx-auto mt-20 px-5 md:px-0'>
      <Card className='bg-[#0058FF] text-white max-w-[358px] min-h-[236px] md:max-w-[688px] md:max-h-[278px] lg:max-w-[1360px] lg:max-h-[404px] mx-auto py-0'>
        <CardContent className='flex flex-col justify-center items-center text-center '> 
          <h1 className='font-bold text-2xl leading-8 tracking-[-0.03em] text-center md:text-[32px] md:leading-10 lg:text-[48px] lg:leading-[100%] font-Inter mt-[20px] md:mt-[35px] lg:mt-[85px]'>Get In Touch</h1>
          <p className='font-normal text-sm leading-5 text-center font-Inter lg:text-lg lg:leading-[30px] mt-[25px] md:mt-[35px] lg:mt-[50px]'>
            Contact us now to enquire our plumbing services, whether you have a
            commercial project that requires support, or a domestic plumbing
            task that needs the attention of a trusted professional.
          </p>
          <Button onClick={()=> alert('thanks for booking')} className='bg-white text-[#0058FF] hover:bg-white font-Inter text-[14px] md:text-[16px] font-bold lg:mt-[40px] mt-[18px] md:mt-[25px] mb-[18px] md:mb-[35px] lg:mb-[77px]'>
            Book a Professional Plumber <ArrowRight />
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
