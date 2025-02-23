import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import { ThemeContext } from '../contexts/ThemeContext';

const CalendarHeader = ({ month, addMonth }) => {
    const currentYear = month.getFullYear();
    const currentMonth = month.toLocaleString('default', { month: 'short' });
    const { colors } = useContext(ThemeContext);

    return (
        <View style={[styles.headerContainer]}>
            {/* Year Navigation Row */}
            <View style={styles.headerRow}>
                <TouchableOpacity
                    onPress={() => addMonth(-12)}
                    style={[styles.iconButton, { borderRadius: 25, backgroundColor: colors.cardBackground }]}
                >
                    <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerText, { color: colors.text, backgroundColor: colors.cardBackground }]}>
                    {currentYear}
                </Text>
                <TouchableOpacity
                    onPress={() => addMonth(12)}
                    style={[styles.iconButton, { borderRadius: 25, backgroundColor: colors.cardBackground }]}
                >
                    <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>
            {/* Month Navigation Row */}
            <View style={styles.headerRow}>
                <TouchableOpacity
                    onPress={() => addMonth(-1)}
                    style={[styles.iconButton, { borderRadius: 25, backgroundColor: colors.cardBackground }]}
                >
                    <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerText, { color: colors.text }]}>{currentMonth}</Text>
                <TouchableOpacity
                    onPress={() => addMonth(1)}
                    style={[styles.iconButton, { borderRadius: 25, backgroundColor: colors.cardBackground }]}
                >
                    <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const BirthdayPicker = ({ birthday, updateBirthday }) => {
    const { colors } = useContext(ThemeContext);
    const today = new Date();
    // Calculate the maximum allowed birthday (i.e. the user must be at least 18)
    const maxBirthday = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxDateString = maxBirthday.toISOString().split('T')[0]; // Format YYYY-MM-DD

    // If birthday is provided, use it; otherwise, default to the max allowed date.
    const initialDate = birthday ? new Date(birthday) : maxBirthday;
    const [currentMonth, setCurrentMonth] = useState(initialDate);
    const [isCalendarOpen, setCalendarOpen] = useState(false);

    const addMonth = (value) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + value);
        setCurrentMonth(newDate);
    };

    const handleDayPress = (day) => {
        // The calendar will disable dates after maxDate, so this should only fire for valid dates.
        updateBirthday(day.dateString);
        // Optionally close the calendar: setCalendarOpen(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Select Date';
        const [year, month, day] = dateString.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.text }]}>When's your birthday?</Text>
            <TouchableOpacity
                style={[
                    styles.dateButton,
                    { backgroundColor: colors.cardBackground, borderColor: 'transparent' },
                ]}
                onPress={() => setCalendarOpen(!isCalendarOpen)}
            >
                <Text style={[styles.dateButtonText, { color: colors.text }]}>
                    {birthday ? formatDate(birthday) : 'Select Date'}
                </Text>
            </TouchableOpacity>
            {isCalendarOpen && (
                <View style={styles.calendarContainer}>
                    <Calendar
                        key={currentMonth.toISOString()}
                        current={currentMonth.toISOString().split('T')[0]}
                        onDayPress={handleDayPress}
                        markedDates={{
                            [birthday]: { selected: true, selectedColor: colors.primary },
                        }}
                        // Set the maximum selectable date
                        maxDate={maxDateString}
                        renderHeader={(date) => {
                            const d = new Date(date);
                            return <CalendarHeader month={d} addMonth={addMonth} />;
                        }}
                        hideArrows={true} // We use our custom header for navigation.
                        theme={{
                            backgroundColor: colors.background,
                            calendarBackground: colors.background,
                            dayTextColor: colors.text,
                            monthTextColor: colors.text,
                            arrowColor: colors.primary,
                            textSectionTitleColor: colors.primary,
                            todayTextColor: colors.text,
                            selectedDayBackgroundColor: colors.primary,
                            selectedDayTextColor: colors.background,
                            todayBackgroundColor: colors.secondary,
                            textDisabledColor: colors.secondary,
                            'stylesheet.calendar.header': {
                                header: {
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingLeft: 0,
                                    paddingRight: 0,
                                    margin: 0,
                                    alignItems: 'center',
                                },
                            },
                        }}
                        style={styles.calendar}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    dateButton: {
        marginTop: 10,
        padding: 20,
        borderRadius: 25,
        height: 60,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 8,
    },
    dateButtonText: {
        fontSize: 16,
    },
    calendarContainer: {
        width: '100%',
    },
    calendar: {
        flex: 1,
    },
    headerContainer: {
        width: '100%',
        paddingVertical: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
    },
    headerText: {
        fontSize: 18,
    },
    iconButton: {
        padding: 8,
    },
});

export default BirthdayPicker;