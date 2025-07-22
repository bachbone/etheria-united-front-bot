export const getStartOfWeekDate = (): Date => {
  const today = new Date();

  const startOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay() + 1, // Monday
  );
  return startOfWeek;
};
