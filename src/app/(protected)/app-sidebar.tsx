'use client'


import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { Bot, CreditCard, LayoutDashboard, Presentation,Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import useProject from '@/hooks/use-project'




const items=[
    {
        title:"Dashboard",
        url:"/dashboard",
        icon:LayoutDashboard
    },
    {
        title:"Q&A",
        url:"/qa",
        icon:Bot
    },
    {
        title:"Meeting",
        url:"/meeting",
        icon:Presentation
    },
    {
        title:"Billing",
        url:"/billing",
        icon:CreditCard
    }

]







export function AppSidebar(){
    const pathname=usePathname()
    const {open}=useSidebar()
    const {projects,projectId,setProjectId}=useProject()
    return (
        <Sidebar collapsible='icon' variant='floating'>
            <SidebarHeader>
                <div className='flex item-center gap-2'>

                  {open &&(  <h1 className='text-xl font-bold text-primary/80'>
                        Git-Inspect
                    </h1>
                  )}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        {items.map(item=>{
                            return(
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} className={cn({
                                            '|bg-primary |text-white':pathname === item.url
                                        },'list-none'

                                        )}>
                                            <item.icon/>
                                            <span>{item.title}</span>
                                            </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
  <SidebarGroupLabel>
    Projects
  </SidebarGroupLabel>
  <SidebarGroupContent>
    <SidebarMenu>
      {projects?.map(project => (
        <SidebarMenuItem key={project.name}>
          <SidebarMenuButton asChild>
            <div className="flex items-center gap-2" onClick={()=>{
                setProjectId(project.id)
            }}>
              <div className={cn("rounded-sm border size-7 flex items-center justify-center text-sm ",
              {"bg-primary text-white":project.id===projectId})}>
                {project.name[0]}
              </div>
              <span>{project.name}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

     
         <div className='h-2'>
         {open &&(
        <SidebarMenuItem>
            <Link href='/create'>
        <Button size='sm' variant={'outline'} className='w-fit mt-3'>
            <Plus/>
            Create Project
        </Button>
        </Link>
        </SidebarMenuItem>
        )}
      </div>
    </SidebarMenu>
  </SidebarGroupContent>
</SidebarGroup>

            </SidebarContent>
        </Sidebar>
    )
}