export const ROUTES = {
  landing:       '/',
  login:         '/login',
  register:      '/register',
  forgotPassword:'/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail:   '/verify-email',

  quotePublic:   (token: string) => `/q/${token}` as const,

  onboarding:    '/onboarding',
  subscribe:     '/subscribe',

  dashboard:          '/app',
  quotes:             '/app/quotes',
  quoteNew:           '/app/quotes/new',
  quoteDetail:        (id: string) => `/app/quotes/${id}` as const,
  quoteEdit:          (id: string) => `/app/quotes/${id}/edit` as const,
  clients:            '/app/clients',
  clientDetail:       (id: string) => `/app/clients/${id}` as const,
  settings:           '/app/settings',
  settingsBusiness:   '/app/settings/business',
  settingsBilling:    '/app/settings/billing',
  settingsLineItems:  '/app/settings/line-items',
} as const