'use client'


import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Bot, CreditCard, LayoutDashboard, Presentation } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'




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

const projects=[
    {
        name:"project 1"
    },
    {
        name:"project 2"
    },
    {
        name:"project 3"
    },
]






export function AppSidebar(){
    const pathname=usePathname()
    return (
        <Sidebar collapsible='icon' variant='floating'>
            <SidebarHeader>
                Logo
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
                        <SidebarGroupContent>
                            <SidebarMenu>
                               { projects.map(project=>{
                                return(
                                    <SidebarMenuItem key={project.name}>
                                        <SidebarMenuButton asChild>
                                            <div>
                                                <div>
                                                    
                                                </div>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                               })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroupLabel>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}