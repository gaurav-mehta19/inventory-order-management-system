const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const numberFormatter = new Intl.NumberFormat('en-US');

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatCurrency(value: string | number): string {
  const numeric = typeof value === 'string' ? Number(value) : value;
  return currencyFormatter.format(Number.isFinite(numeric) ? numeric : 0);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
