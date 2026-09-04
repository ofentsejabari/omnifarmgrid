export const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

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
  return date.toISOString().slice(0, 10);
};
