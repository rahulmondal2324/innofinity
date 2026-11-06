import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { DashboardWelcome } from './dashboard-welcome';
interface PreviewOrder {
  id: string;
  customer: string;
  initials: string;
  device: string;
  detail: string;
  type: 'Sell' | 'Buy';
  amount: number;
  status: string;
}
@Component({
  selector: 'iw-admin-dashboard',
  imports: [RouterLink, DashboardWelcome],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly currency = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  });
  readonly period = signal<'7' | '30'>('7');
  readonly filter = signal('All orders');
  readonly search = signal('');
  readonly filters = ['All orders', 'Sell', 'Buy'];
  readonly orders: PreviewOrder[] = [
    {
      id: 'IW-1048',
      customer: 'Alex Morgan',
      initials: 'AM',
      device: 'iPhone 15 Pro',
      detail: '256 GB · Natural Titanium',
      type: 'Sell',
      amount: 485,
      status: 'Awaiting device',
    },
    {
      id: 'IW-1047',
      customer: 'Jamie Taylor',
      initials: 'JT',
      device: 'iPhone 14',
      detail: '128 GB · Midnight',
      type: 'Buy',
      amount: 329,
      status: 'Processing',
    },
    {
      id: 'IW-1046',
      customer: 'Sam Wilson',
      initials: 'SW',
      device: 'MacBook Air M2',
      detail: '256 GB · Space Grey',
      type: 'Sell',
      amount: 580,
      status: 'Completed',
    },
    {
      id: 'IW-1045',
      customer: 'Charlie Lee',
      initials: 'CL',
      device: 'Samsung Galaxy S23',
      detail: '128 GB · Phantom Black',
      type: 'Buy',
      amount: 285,
      status: 'Dispatched',
    },
  ];
  readonly visibleOrders = computed(() =>
    this.orders.filter(
      (order) =>
        (this.filter() === 'All orders' || order.type === this.filter()) &&
        [order.id, order.customer, order.device].some((value) =>
          value.toLowerCase().includes(this.search().trim().toLowerCase()),
        ),
    ),
  );
  readonly metrics = computed(() =>
    this.period() === '7'
      ? [
          {
            label: 'Total order value',
            value: '£12,840',
            change: '+12.8%',
            icon: 'bag',
            detail: 'Across buy & sell orders',
          },
          {
            label: 'Sell orders',
            value: '48',
            change: '+8.2%',
            icon: 'arrow-left-right',
            detail: 'Devices coming your way',
          },
          {
            label: 'Buy orders',
            value: '32',
            change: '+16.4%',
            icon: 'box-seam',
            detail: 'Customer purchase activity',
          },
          {
            label: 'New customers',
            value: '24',
            change: '+6.3%',
            icon: 'people',
            detail: 'Growing your community',
          },
        ]
      : [
          {
            label: 'Total order value',
            value: '£48,260',
            change: '+10.2%',
            icon: 'bag',
            detail: 'Across buy & sell orders',
          },
          {
            label: 'Sell orders',
            value: '186',
            change: '+7.4%',
            icon: 'arrow-left-right',
            detail: 'Devices coming your way',
          },
          {
            label: 'Buy orders',
            value: '124',
            change: '+14.1%',
            icon: 'box-seam',
            detail: 'Customer purchase activity',
          },
          {
            label: 'New customers',
            value: '91',
            change: '+5.8%',
            icon: 'people',
            detail: 'Growing your community',
          },
        ],
  );
  readonly quickLinks = [
    {
      label: 'Add a laptop',
      description: 'Grow your Apple collection',
      path: '/apple-laptops/add',
      icon: 'bag',
    },
    {
      label: 'Add a sell model',
      description: 'Expand your trade-in range',
      path: '/sell/device-model/add',
      icon: 'arrow-left-right',
    },
    {
      label: 'Manage website',
      description: 'Keep your content up to date',
      path: '/page/list',
      icon: 'globe2',
    },
    {
      label: 'View enquiries',
      description: 'Stay close to your customers',
      path: '/enquiries',
      icon: 'envelope',
    },
  ];
}
