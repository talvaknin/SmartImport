import { useState } from 'react'
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react'
import { LayoutDashboard, Ship, CreditCard, Factory, Package, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const NAV = [
  { key: 'dashboard', label: 'דשבורד', icon: LayoutDashboard },
  { key: 'shipments', label: 'משלוחים', icon: Ship },
  { key: 'payments', label: 'תשלומים', icon: CreditCard },
  { key: 'suppliers', label: 'ספקים', icon: Factory },
  { key: 'products', label: 'מקטים', icon: Package },
]

function Brand({ compact }) {
  return (
    <div className={`flex items-center gap-2.5 ${compact ? '' : 'px-4 py-5'}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-lg font-extrabold text-white shadow-sm">U</div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-white">SmartImport</div>
        <div className="text-[11px] text-slate-400">UMI Group</div>
      </div>
    </div>
  )
}

function AccountMenu({ email }) {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar size="sm" className="cursor-pointer bg-brand-blue text-white" name={(email || 'U')[0].toUpperCase()} />
      </DropdownTrigger>
      <DropdownMenu aria-label="חשבון">
        <DropdownItem key="email" isReadOnly className="opacity-70" textValue={email}>
          <span dir="ltr" className="text-xs">{email}</span>
        </DropdownItem>
        <DropdownItem key="logout" color="danger" startContent={<LogOut size={15} />}
          onPress={() => supabase.auth.signOut()}>
          התנתקות
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default function AppShell({ page, onNav, email, title, children }) {
  return (
    <div className="flex min-h-screen bg-brand-bg">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-col bg-brand-navy md:flex">
        <Brand />
        <nav className="mt-2 flex flex-col gap-1 px-3" aria-label="ניווט ראשי">
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = page === key
            return (
              <button key={key} type="button" onClick={() => onNav(key)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                  active ? 'bg-brand-blue text-white shadow-md' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}>
                <Icon size={19} />
                {label}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 p-3">
          <div className="mb-2 truncate px-1 text-[11px] text-slate-400" dir="ltr">{email}</div>
          <Button size="sm" variant="flat" className="w-full bg-white/10 text-slate-200 data-[hover=true]:bg-white/20"
            startContent={<LogOut size={15} />} onPress={() => supabase.auth.signOut()}>
            התנתקות
          </Button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-brand-border bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          {/* brand block on mobile (navy chip), title on desktop */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue text-base font-extrabold text-white">U</div>
          </div>
          <h1 className="text-lg font-bold text-brand-text">{title}</h1>
          <div className="ms-auto"><AccountMenu email={email} /></div>
        </header>

        {/* content — extra bottom padding on mobile for the bottom nav */}
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-brand-border bg-white/95 backdrop-blur md:hidden"
        aria-label="ניווט תחתון">
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = page === key
          return (
            <button key={key} type="button" onClick={() => onNav(key)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none ${
                active ? 'text-brand-blue' : 'text-slate-400'}`}
              style={{ minHeight: 56 }}>
              <Icon size={21} className={active ? 'scale-110 transition-transform' : ''} />
              {label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
