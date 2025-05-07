import { SidebarNav } from '@/components/ui/sidebar-nav'
import { Separator } from '@/components/ui/separator'

const defaultSidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
  },
]

const adminSidebarNavItems = [
  {
    title: 'Users',
    href: '/settings/users',
  },
  {
    title: 'Roles',
    href: '/settings/roles',
  },
  {
    title: 'Organizations',
    href: '/settings/organizations',
  },
]

const organizationSidebarNavItems = [
  {
    title: 'Minhas organizações',
    href: '/settings/my-organizations',
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={defaultSidebarNavItems} />
          <Separator className="my-6" />
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-medium">Admin</h3>
            <SidebarNav items={adminSidebarNavItems} />
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-medium">Organizações</h3>
            <SidebarNav items={organizationSidebarNavItems} />
          </div>
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  )
}
