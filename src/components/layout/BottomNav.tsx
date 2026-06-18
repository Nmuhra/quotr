import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/dashboard', label: 'Home' },
  { to: '/quotes',    label: 'Quotes' },
  { to: '/clients',   label: 'Clients' },
  { to: '/settings',  label: 'Settings' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex">
      {tabs.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center text-xs font-medium
             ${isActive ? 'text-blue-600' : 'text-gray-500'}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}