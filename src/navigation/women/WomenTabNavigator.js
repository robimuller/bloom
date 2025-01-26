// // WomenTabNavigator.js
// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import Ionicons from '@expo/vector-icons/Ionicons';

// import WomenFeedStack from './WomenFeedStack';
// import WomenRequestsStack from './WomenRequestsStack';
// import WomenSettingsStack from './WomenSettingsStack';

// const Tab = createBottomTabNavigator();

// export default function WomenTabNavigator() {
//     return (
//         <Tab.Navigator
//             screenOptions={({ route }) => ({
//                 tabBarIcon: ({ focused, color, size }) => {
//                     let iconName;
//                     if (route.name === 'WomenFeedTab') {
//                         iconName = focused ? 'albums' : 'albums-outline';
//                     } else if (route.name === 'WomenRequestsTab') {
//                         iconName = focused ? 'list' : 'list-outline';
//                     } else if (route.name === 'WomenSettingsTab') {
//                         iconName = focused ? 'settings' : 'settings-outline';
//                     }
//                     return <Ionicons name={iconName} size={size} color={color} />;
//                 },
//             })}
//         >
//             <Tab.Screen
//                 name="WomenFeedTab"
//                 component={WomenFeedStack}
//                 options={{ title: 'Feed', headerShown: false }}
//             />
//             <Tab.Screen
//                 name="WomenRequestsTab"
//                 component={WomenRequestsStack}
//                 options={{ title: 'Requests', headerShown: false }}
//             />
//             <Tab.Screen
//                 name="WomenSettingsTab"
//                 component={WomenSettingsStack}
//                 options={{ title: 'Settings', headerShown: false }}
//             />
//         </Tab.Navigator>
//     );
// }
