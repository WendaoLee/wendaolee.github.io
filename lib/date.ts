

/**
 * 如果是你想要的日期，那也好
 * @param date 
 * @returns 
 */
  export const getReadableDate = (date: string) => {
    return (
      new Date(date).getFullYear() +
      "-" +
      (new Date(date).getMonth() + 1) +
      "-" +
      new Date(date).getDate()
    );
  };