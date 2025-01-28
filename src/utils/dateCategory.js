// src/utils/dateCategory.js


export function getDateCategory(dateString) {
    // Parse the string into a Date object
    const target = new Date(dateString);
    const now = new Date();

    // Zero out hours/min/sec for simpler comparisons
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayDiff = (target - today) / (1000 * 60 * 60 * 24);

    // A few naive checks for demonstration:
    if (dayDiff < 0 && isSameDay(target, today)) {
        return 'today'; // e.g. if it's still the same calendar day
    }
    if (isSameDay(target, today)) {
        return 'today';
    }
    if (isTomorrow(target, today)) {
        return 'tomorrow';
    }
    if (isThisWeekend(target)) {
        return 'this weekend';
    }
    if (dayDiff <= 7) {
        return 'this week';
    }
    if (dayDiff <= 14) {
        return 'next week';
    }
    if (isSameMonth(target, today)) {
        return 'this month';
    }
    if (isSameYear(target, today)) {
        return 'this year';
    }
    return 'any day';
}

function isSameDay(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

function isTomorrow(target, today) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDay(target, tomorrow);
}

function isThisWeekend(date) {
    // e.g. Saturday = 6, Sunday = 0
    const day = date.getDay();
    return day === 6 || day === 0;
}

function isSameMonth(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth()
    );
}

function isSameYear(d1, d2) {
    return d1.getFullYear() === d2.getFullYear();
}