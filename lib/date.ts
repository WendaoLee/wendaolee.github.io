

/**
 * 如果是你想要的日期，那也好
 * @param date 
 * @returns 
 */
  export const getReadableDate = (date: string) => {
    const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(date.trim());
    if (isoDateMatch) {
      return `${Number(isoDateMatch[1])}-${Number(isoDateMatch[2])}-${Number(isoDateMatch[3])}`;
    }
    const parsed = new Date(date);
    return (
      parsed.getUTCFullYear() +
      "-" +
      (parsed.getUTCMonth() + 1) +
      "-" +
      parsed.getUTCDate()
    );
  };