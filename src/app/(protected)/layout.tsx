import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import {AppSidebar} from '../(protected)/app-sidebar'
import React, { Suspense } from 'react'

// Loading component for the layout
const LayoutSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-16 bg-gray-200 rounded-md mb-4"></div>
    <div className="h-32 bg-gray-200 rounded-md mb-4"></div>
    <div className="h-64 bg-gray-200 rounded-md"></div>
  </div>
)

type Props={
    children:React.ReactNode
}

const SidebarLayout = ({children}:Props) => {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset className='w-full m-2'>
        <div className='sticky top-2 z-20 flex items-center gap-2 rounded-lg bg-transparent p-2 px-4'>
          <div className='md:hidden'>
            <SidebarTrigger />
          </div>
          <div className='ml-auto'></div>
          <UserButton/>
        </div>
        <div className='h-4'>
          <div className='rounded-lg bg-transparent overflow-y-auto h-[calc(100vh-6rem)] p-4'>
            <Suspense fallback={<LayoutSkeleton />}>
              {children}
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default SidebarLayout