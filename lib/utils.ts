import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export interface DateParts {
  month: string,
  year: number,
  day: number,
  hour: number,
  minutes:string,
  amPm: string
}

export function formatDateParts(date: Date) {
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const month = shortMonths[date.getMonth()];
  const year = date.getFullYear();
  const day = date.getDate();
  let hour = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const amPm = hour >= 12 ? "PM" : "AM";

  // Convert hour to 12-hour format
  hour = hour % 12 || 12;

  return {
    month,
    year,
    day,
    hour,
    minutes,
    amPm,
  };
}

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  }
  const dateWeekdayOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  }

  const formattedDateTime: string = new Date(dateString).toLocaleString('en-US', dateTimeOptions)

  const formattedDate: string = new Date(dateString).toLocaleString('en-US', dateOptions)
  const formattedDateWeedDay: string = new Date(dateString).toLocaleString('en-US',dateWeekdayOptions )

  const formattedTime: string = new Date(dateString).toLocaleString('en-US', timeOptions)

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    dateWeekDay: formattedDateWeedDay,
    timeOnly: formattedTime,
  }
}

export const parseToDate = (dateString: string): Date | null => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getfilteredUpcomingEvents = (now: Date, allEvents: any[], limit: number = 3) => {

  const upcomingEvents = allEvents
    .filter(event => {
      if (!event.start) return false;

      // Include events that haven't ended yet (either upcoming or ongoing)
      const start = event.start ? parseToDate(event.start.toString()) : null;
      const end = event.end ? parseToDate(event.end.toString()) : null;
      const hasEnded = end ? end < now : (start ? start < now : false);

      return !hasEnded; // Include if not ended
    })
    .map(event => ({
      ...event,
      start: event.start ? parseToDate(event.start.toString()) : null,
      end: event.end ? parseToDate(event.end.toString()) : null
    }))
    .sort((a, b) => {
      const dateA = a.start?.getTime() || 0;
      const dateB = b.start?.getTime() || 0;
      return dateA - dateB; // Sort by ascending date
    })
    .slice(0, limit);

    return upcomingEvents
}