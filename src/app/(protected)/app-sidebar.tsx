'use client'


import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { Bot, CreditCard, LayoutDashboard, Presentation,Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
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
    const router = useRouter()
    const {open, setOpenMobile}=useSidebar()
    const {projects,projectId,setProjectId}=useProject()
    return (
        <Sidebar collapsible='icon' variant='floating'>
            <SidebarHeader>
            <div className="flex items-center gap-2">
  {open && (
    <Link href="/" className="text-xl font-bold text-primary/80 bg-[linear-gradient(90deg,_#9ca3af_0%,_#ffffff_20%,_#9ca3af_40%,_#9ca3af_100%)] bg-clip-text text-transparent [background-size:200%_100%] [animation:shine_3s_linear_infinite]">
      Git-Inspect
    </Link>
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
                            <SidebarMenuButton
                                      asChild
                                      isActive={pathname === item.url}
                                      className={cn('list-none data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:data-[active=true]:bg-primary/90')}
                                    >
                                        <Link href={item.url}>
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
                {open && (
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <Link href='/create'>
                          <Button size='sm' variant={'outline'} className='w-full'>
                            <Plus/>
                            Create Project
                          </Button>
                        </Link>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                )}
                <SidebarGroup>
  <SidebarGroupLabel>
    Projects
  </SidebarGroupLabel>
  <SidebarGroupContent>
    <SidebarMenu>
      {projects?.map(project => (
        <SidebarMenuItem key={project.name}>
          <SidebarMenuButton asChild>
            <button type="button" className="flex items-center gap-2" onClick={()=>{
                setProjectId(project.id)
                if (pathname !== '/dashboard') {
                  router.push('/dashboard')
                }
                setOpenMobile(false)
            }}>
              <div className={cn("rounded-sm border size-7 flex items-center justify-center text-sm ",
              {"bg-primary text-white":project.id===projectId})}>
                {project.name[0]}
              </div>
              <span>{project.name}</span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

    </SidebarMenu>
  </SidebarGroupContent>
</SidebarGroup>

            </SidebarContent>
        </Sidebar>
    )
}