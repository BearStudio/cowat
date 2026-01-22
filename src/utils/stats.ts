import dayjs from "dayjs";

export type chartDataProps = {
  year: number;
  value: number;
  actualYear?: boolean;
};

type DateGetter<T> = (item: T) => Date | undefined | null;

const currentYear = dayjs().year();
const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

export const getAll = <T>(items: T[]) => items.length;

export const getActualYear = <T>(items: T[], getDate: DateGetter<T>) => {
  return items.filter((item) => dayjs(getDate(item)).isSame(dayjs(), "year"))
    .length;
};

export const getByYears = <T>(items: T[], getDate: DateGetter<T>) => {
  return years.map((year) => ({
    year,
    value: items.filter((item) =>
      dayjs(getDate(item)).isSame(dayjs().year(year), "year")
    ).length,
    actualYear: year === currentYear,
  }));
};
