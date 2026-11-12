export const isoToDate = (iso: string | undefined | null): Date | undefined => {
  if (!iso) {
    return undefined;
  }
  // Accepts a plain date (2025-12-27) or an Appwrite datetime (2025-12-27T00:00:00.000+00:00).
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(iso);
  if (!match) {
    return undefined;
  }
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const dateToIso = (date: Date | null | undefined): string => {
  if (!date) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayIsoDate = (): string => dateToIso(new Date());

export const nowIso = (): string => new Date().toISOString();

export const isExpired = (
  isoDate: string | undefined,
  onDate = todayIsoDate(),
): boolean => {
  return Boolean(isoDate) && isoDate! < onDate;
};

export const expiresWithinDays = (
  isoDate: string | undefined,
  days: number,
  onDate = todayIsoDate(),
): boolean => {
  if (!isoDate) {
    return false;
  }
  const until = new Date(`${onDate}T00:00:00`);
  until.setDate(until.getDate() + days);
  const expiry = new Date(`${isoDate}T00:00:00`);
  return expiry >= new Date(`${onDate}T00:00:00`) && expiry <= until;
};

export const daysAgoIsoDate = (days: number, from = new Date()): string => {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  return dateToIso(date);
};

/** "Today", "Yesterday", "3 days ago", or "12 Oct" for older dates. */
export const friendlyDate = (
  iso: string | undefined | null,
  today = new Date(),
): string => {
  const date = isoToDate(iso ?? undefined);
  if (!date) {
    return iso ?? '';
  }
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diff = Math.round((start.getTime() - date.getTime()) / 86_400_000);
  if (diff === 0) {
    return 'Today';
  }
  if (diff === 1) {
    return 'Yesterday';
  }
  if (diff > 1 && diff < 7) {
    return `${diff} days ago`;
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() === today.getFullYear() ? {} : { year: 'numeric' }),
  });
};

/** "27 Dec 2025" for a plain date or datetime string; empty when missing. */
export const longDate = (iso: string | undefined | null): string => {
  const date = isoToDate(iso);
  return date
    ? date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : (iso ?? '');
};
