import { SidebarProvider } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import {AppSidebar} from '../(protected)/app-sidebar'
import React from 'react'


type Props={
    children:React.ReactNode
}


const SidebarLayout = ({children}:Props) => {
  return (
    <SidebarProvider>
      <AppSidebar/>
     <main className='w-full m-2'>
        <div className='flex item-center gap-2 border-sidebar-border bg-sidebar border shadow rounder-md p-2 px-4'>
          {/* { <Searchbar></Searchbar> } */}
          <div className='ml-auto'></div>
          <UserButton/>
        </div>
        <div className='h-4'>
        <div className='border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4'>
            {children}
        </div>
        </div>
     </main>
        </SidebarProvider>
  )
}

export default SidebarLayout