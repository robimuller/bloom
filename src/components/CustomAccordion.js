// src/components/CustomAccordion.js
import React, { useState, useContext } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../contexts/ThemeContext';
import { useTheme } from 'react-native-paper';



// Because you asked to remove the bottom border,
// we comment out the <Divider /> or remove it entirely

export default function CustomAccordion({
    title,
    subtitle,        // New: brief description
    icon,
    children,
    backgroundColor,
    textColor,
    subtitleColor,    // color for the subtitle
}) {
    const [expanded, setExpanded] = useState(false);
    const { themeMode, toggleTheme } = useContext(ThemeContext);
    const paperTheme = useTheme();



    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    return (
        <View style={[styles.accordionContainer, { backgroundColor }]}>
            <TouchableWithoutFeedback
                onPress={toggleExpanded}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${title} Accordion`}
            >
                <View style={styles.header}>
                    {/* Row: Icon, Title, Chevron */}
                    <View style={styles.titleRow}>
                        <Icon
                            name={icon}
                            size={24}
                            color={paperTheme.colors.secondary}
                            style={styles.icon}
                        />
                        <Text style={[styles.title, { color: paperTheme.colors.text }]}>
                            {title}
                        </Text>
                        <Icon
                            name={expanded ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color={textColor}
                            style={styles.chevron}
                        />
                    </View>

                    {/* Subtitle (brief description) */}
                    {subtitle ? (
                        <Text style={[styles.subtitle, { color: subtitleColor }]}>
                            {subtitle}
                        </Text>
                    ) : null}
                </View>
            </TouchableWithoutFeedback>

            {/* Expanded content */}
            {expanded && (
                <View style={styles.content}>
                    {children}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    accordionContainer: {
        marginVertical: 4,
        borderRadius: 10,
        overflow: 'hidden',
    },
    header: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 12,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    chevron: {
        marginLeft: 8,
    },
    subtitle: {
        marginTop: 5,
        fontSize: 12,
        fontWeight: "300"
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        // Inherit parent background by default
    },
});