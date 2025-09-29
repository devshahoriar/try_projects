import { createFileRoute } from '@tanstack/react-router'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../components/ui/accordion'

export const Route = createFileRoute('/faq')({
  component: RouteComponent,
})

const AccordionTemplate = ({
  title,
  description,
  value,
}: {
  title: string
  description: string
  value: string
}) => (
  <AccordionItem value={value}>
    <AccordionTrigger className='font-inter font-semibold text-[16px] leading-[24px] md:text-[20px] md:leading-[28px] lg:text-[28px] lg:leading-[40px] tracking-tight hover:no-underline'>
      {title}
    </AccordionTrigger>
    <AccordionContent className='font-inter font-normal text-[14px] leading-[20px] lg:text-[18px] lg:leading-[30px]'>
      {description}
    </AccordionContent>
  </AccordionItem>
)

function RouteComponent() {
  return (
    <main className='container mx-auto mt-20 px-5 md:px-0'>
      <h1 className='font-inter font-bold text-[24px] leading-[32px] md:text-[32px] md:leading-[40px] lg:text-[48px] lg:leading-[100%] tracking-tight text-center'>
        Frequently asked questions
      </h1>

      <div className='max-w-[920px] mx-auto mt-[120px]'>
        <Accordion
          type='single'
          collapsible
          className='w-full'
          defaultValue='item-1'
        >
          <AccordionTemplate
            value='item-1'
            title='Do plumbers deal with heating?'
            description='Some of our local plumbers are also gas registered and experienced working on heating systems, bathrooms and kitchens.'
          />
          <AccordionTemplate
            value='item-2'
            title='Do you charge a call out fee?'
            description='We do not charge a call out fee. You only pay for the work we carry out and any parts that are needed.'
          />
          <AccordionTemplate
            value='item-3'
            title='How quickly can your company send out an engineer?'
            description='We can often send out an engineer the same day. In some cases, we can even be with you within the hour.'
          />
          <AccordionTemplate
            value='item-4'
            title='What should I do if I get a water leak?'
            description='Turn off the water supply at the mains and call us. We will get an engineer out to you as soon as possible.'
          />
        </Accordion>
      </div>
    </main>
  )
}
