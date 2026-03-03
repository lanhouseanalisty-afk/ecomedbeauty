import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isWeekend,
    isAfter,
    startOfDay,
    isSameMonth,
    differenceInBusinessDays,
    getDay,
    isBefore
} from "date-fns";
import { LancamentoDiario } from "@/types/crm/forecast";

export interface ForecastWeek {
    weekIndex: number;
    days: Date[];
}

/**
 * Groups days into weeks (Mon-Fri) as Jean does in his spreadsheet.
 */
export const groupDaysIntoWeeks = (currentDate: Date): ForecastWeek[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Filter out weekends (keeping Mon-Fri, 1-5)
    // In Jean's spreadsheet, it looks like he specifically tracks Mon-Fri.
    const workDays = allDays.filter(day => !isWeekend(day));

    const weeks: ForecastWeek[] = [];
    let currentWeekDays: Date[] = [];
    let currentWeekIndex = 0;

    workDays.forEach((day, index) => {
        currentWeekDays.push(day);

        // If it's Friday (5) or the last working day of the month, close the week
        if (getDay(day) === 5 || index === workDays.length - 1) {
            weeks.push({
                weekIndex: currentWeekIndex++,
                days: currentWeekDays
            });
            currentWeekDays = [];
        }
    });

    return weeks;
};

/**
 * Calculates projection for the month based on daily average of realized days.
 */
export const calculateProjection = (
    currentDate: Date,
    lancamentos: LancamentoDiario[],
    totalRealized: number
) => {
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // If we are looking at a past month, projection = totalRealized
    if (isAfter(monthStart, today) || !isSameMonth(monthStart, today)) {
        if (isBefore(monthStart, today)) return totalRealized;
        return 0; // Future month with no data
    }

    // Current month: count business days passed including today
    const totalBusinessDays = differenceInBusinessDays(monthEnd, monthStart) + 1;
    const daysPassed = differenceInBusinessDays(today, monthStart); // days before today

    // Total realized including weekends (if any)
    // We'll calculate daily average based on business days passed
    const dailyAvg = daysPassed > 0 ? totalRealized / daysPassed : totalRealized;

    return dailyAvg * totalBusinessDays;
};

/**
 * Formats a currency value to BRL.
 */
export const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};
