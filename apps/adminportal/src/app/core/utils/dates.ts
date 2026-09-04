export const isoToDate = (iso: string | undefined | null): Date | undefined => {
  if (!iso) {
    return undefined;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return undefined;
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
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

export const isExpired = (isoDate: string | undefined, onDate = todayIsoDate()): boolean => {
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

export const monthsAgoIsoDate = (months: number, from = new Date()): string => {
  const date = new Date(from);
  date.setMonth(date.getMonth() - months);
  return dateToIso(date);
};
