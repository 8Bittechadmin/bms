export const pagesOptions = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'venues', label: 'Venues' },
  { key: 'clients', label: 'Clients' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'billing', label: 'Billing' },
  { key: 'event_planning', label: 'Event Planning' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
  { key: 'staff', label: 'Staff' },
  { key: 'catering', label: 'Catering' },
];

export const permissionOptions = [
  { value: 'all', label: 'All' },
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'edit', label: 'Edit' },
  { value: 'delete', label: 'Delete' },
];

export default { pagesOptions, permissionOptions };
