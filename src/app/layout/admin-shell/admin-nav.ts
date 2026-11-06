export interface NavItem {
  label: string;
  path?: string;
  icon?: string;
  children?: NavItem[];
}
const groupIcons: Record<string, string> = {
  Page: 'file-earmark-text',
  FAQ: 'question-circle',
  Testimonial: 'chat-left-quote',
  Network: 'wifi',
  Device: 'phone',
  Attribute: 'sliders',
  Model: 'layers',
  'Apple Laptops': 'laptop',
  'Popular Selling Models': 'star',
};
const group = (label: string, path: string, list = `${label} List`, settings = true): NavItem => ({
  label,
  icon: groupIcons[label] ?? 'grid',
  children: [
    { label: list, path: `${path}/list`, icon: 'list-ul' },
    { label: label === 'Page' ? 'Add Page' : 'Add New', path: `${path}/add`, icon: 'plus-lg' },
    ...(settings ? [{ label: 'Setting', path: `${path}/setting`, icon: 'gear' }] : []),
  ],
});
export const ADMIN_NAV: { label: string; items: NavItem[] }[] = [
  { label: 'WORKSPACE', items: [{ label: 'Dashboard', path: '/dashboard', icon: 'grid-1x2' }] },
  {
    label: 'WEBSITE CONTENT',
    items: [
      group('Page', '/page', 'Page List', false),
      {
        label: 'FAQ',
        icon: 'question-circle',
        children: [
          { label: 'FAQ List', path: '/faq/list', icon: 'list-ul' },
          { label: 'Add New', path: '/faq/add', icon: 'plus-lg' },
          { label: 'Categories', path: '/faq/categories', icon: 'layers' },
        ],
      },
      group('Testimonial', '/testimonial'),
    ],
  },
  {
    label: 'COMMERCE',
    items: [
      group('Network', '/network'),
      {
        label: 'Sell Management',
        icon: 'arrow-left-right',
        children: [
          group('Device', '/sell/device'),
          group('Attribute', '/sell/storage'),
          group('Model', '/sell/device-model'),
        ],
      },
      group('Apple Laptops', '/apple-laptops', 'Apple Laptop List', false),
      group('Popular Selling Models', '/popular-selling-models', 'Models List'),
      {
        label: 'Order List',
        icon: 'box-seam',
        children: [
          { label: 'Sell Order', path: '/orders/sell', icon: 'arrow-left-right' },
          { label: 'Buy Order', path: '/orders/buy', icon: 'bag' },
        ],
      },
    ],
  },
  {
    label: 'ADMINISTRATION',
    items: [
      { label: 'User List', path: '/users', icon: 'people' },
      { label: 'Enquiry', path: '/enquiries', icon: 'envelope' },
      { label: 'Settings', path: '/settings', icon: 'gear' },
      { label: 'Change Password', path: '/change-password', icon: 'lock' },
    ],
  },
];
export function findNav(
  path: string,
  items = ADMIN_NAV.flatMap((group) => group.items),
): NavItem | undefined {
  for (const item of items) {
    if (item.path === path) return item;
    const child = item.children && findNav(path, item.children);
    if (child) return child;
  }
  return undefined;
}
