// // src/screens/auth/emailWizard/EmailStep3.js

// import React, { useState, useContext } from 'react';
// import { View, StyleSheet, Pressable, Image } from 'react-native';
// import { Text, TextInput, IconButton, useTheme } from 'react-native-paper';
// import * as ImagePicker from 'expo-image-picker';

// // For Reanimated
// import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';

// import { ThemeContext } from '../../../contexts/ThemeContext';
// import { SignUpContext } from '../../../contexts/SignUpContext';
// import { WizardContext } from '../../../contexts/WizardContext';

// import SignUpLayout from '../../../components/SignUpLayout';

// export default function EmailStep3({ navigation }) {
//     const paperTheme = useTheme();
//     const { theme } = useContext(ThemeContext);
//     const { profileInfo, preferences, updateProfileInfo, updatePreferences } = useContext(SignUpContext);

//     // We now have 4 sub-steps in Step3 (photos + age range + interests + radius)
//     const { subStep, progress, goNextSubStep, goPrevSubStep } = useContext(WizardContext);

//     const [localError, setLocalError] = useState(null);

//     // --- Photos (SubStep #1) ---
//     // Start with whatever is in context (if user returns to edit later)
//     const [photos, setPhotos] = useState(profileInfo.photos || []);

//     // --- The rest of your fields (SubSteps #2, #3, #4) ---
//     const [ageRange, setAgeRange] = useState(preferences.ageRange || [18, 35]);
//     const [interests, setInterests] = useState(preferences.interests || []);
//     const [geoRadius, setGeoRadius] = useState(preferences.geoRadius || 50);

//     /******************************************************
//      *           SUB-STEP #1: PHOTO PICKING
//      ******************************************************/
//     const handlePickPhoto = async (index) => {
//         try {
//             // Request permission
//             const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//             if (permissionResult.granted === false) {
//                 setLocalError('Permission to access camera roll is required!');
//                 return;
//             }

//             // Launch the picker
//             const pickerResult = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false });
//             if (!pickerResult.canceled && pickerResult.assets?.[0]?.uri) {
//                 const newPhotos = [...photos];
//                 newPhotos[index] = pickerResult.assets[0].uri; // Insert or replace
//                 setPhotos(newPhotos);
//             }
//         } catch (error) {
//             console.log('Photo pick error:', error);
//             setLocalError(error.message);
//         }
//     };

//     const handleRemovePhoto = (index) => {
//         // Remove the photo at the given index
//         const newPhotos = [...photos];
//         newPhotos.splice(index, 1);
//         setPhotos(newPhotos);
//     };

//     const renderSubStep1 = () => {
//         // We’ll show 6 slots
//         const photoGrid = Array.from({ length: 6 }, (_, i) => {
//             const uri = photos[i] || null;
//             return (
//                 <Animated.View
//                     key={`photo-slot-${i}`}
//                     style={styles.photoSlotWrapper}
//                     entering={FadeIn}
//                     exiting={FadeOut}
//                     layout={Layout}
//                 >
//                     <Pressable
//                         style={[styles.photoSlot, uri && { borderWidth: 0 }]}
//                         onPress={() => handlePickPhoto(i)}
//                     >
//                         {uri ? (
//                             <>
//                                 <Image source={{ uri }} style={styles.photoImage} />
//                                 {/* Show 'X' to remove if there's a photo */}
//                                 <Pressable
//                                     style={styles.removeButton}
//                                     onPress={() => handleRemovePhoto(i)}
//                                 >
//                                     <Text style={styles.removeButtonText}>X</Text>
//                                 </Pressable>
//                             </>
//                         ) : (
//                             <Text style={[styles.photoPlaceholderText, { color: theme.text }]}>
//                                 + Add
//                             </Text>
//                         )}
//                     </Pressable>
//                 </Animated.View>
//             );
//         });

//         return (
//             <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
//                 <View style={styles.panelHeader}>
//                     <IconButton icon="image-multiple" iconColor={theme.primary} />
//                     <Text style={[styles.panelTitle, { color: theme.text }]}>Your Photos</Text>
//                 </View>
//                 <Text style={[styles.panelSubtitle, { color: theme.text }]}>
//                     Add up to 6 pictures. Tap a slot to pick an image.
//                 </Text>

//                 <View style={styles.photoGrid}>{photoGrid}</View>
//             </View>
//         );
//     };

//     /******************************************************
//      *    SUB-STEP #2: AGE RANGE
//      ******************************************************/
//     const renderSubStep2 = () => (
//         <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
//             <View style={styles.panelHeader}>
//                 <IconButton icon="account-multiple" iconColor={theme.primary} />
//                 <Text style={[styles.panelTitle, { color: theme.text }]}>Desired Age Range</Text>
//             </View>
//             <Text style={[styles.panelSubtitle, { color: theme.text }]}>
//                 Pick the minimum and maximum ages you’d like to meet.
//             </Text>

//             <TextInput
//                 mode="outlined"
//                 label="Age Range (comma-separated)"
//                 placeholder="18,35"
//                 style={styles.input}
//                 theme={{
//                     ...paperTheme,
//                     colors: { ...paperTheme.colors, text: theme.text },
//                 }}
//                 value={ageRange.join(',')}
//                 onChangeText={(val) => {
//                     const parts = val.split(',').map((v) => parseInt(v.trim()) || 0);
//                     setAgeRange(parts);
//                 }}
//             />
//         </View>
//     );

//     /******************************************************
//      *    SUB-STEP #3: INTERESTS
//      ******************************************************/
//     const renderSubStep3 = () => (
//         <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
//             <View style={styles.panelHeader}>
//                 <IconButton icon="star-outline" iconColor={theme.primary} />
//                 <Text style={[styles.panelTitle, { color: theme.text }]}>Your Interests</Text>
//             </View>
//             <Text style={[styles.panelSubtitle, { color: theme.text }]}>
//                 (Optional) Let us know what you love. e.g. hiking, dining, dancing...
//             </Text>

//             <TextInput
//                 mode="outlined"
//                 label="Interests (comma-separated)"
//                 placeholder="e.g. hiking, dining"
//                 style={styles.input}
//                 theme={{
//                     ...paperTheme,
//                     colors: { ...paperTheme.colors, text: theme.text },
//                 }}
//                 value={interests.join(', ')}
//                 onChangeText={(val) => {
//                     const arr = val.split(',').map((v) => v.trim());
//                     setInterests(arr);
//                 }}
//             />
//         </View>
//     );

//     /******************************************************
//      *    SUB-STEP #4: SEARCH RADIUS
//      ******************************************************/
//     const renderSubStep4 = () => (
//         <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
//             <View style={styles.panelHeader}>
//                 <IconButton icon="map-marker" iconColor={theme.primary} />
//                 <Text style={[styles.panelTitle, { color: theme.text }]}>Search Radius</Text>
//             </View>
//             <Text style={[styles.panelSubtitle, { color: theme.text }]}>
//                 How far (in km) are you willing to meet or travel?
//             </Text>

//             <TextInput
//                 mode="outlined"
//                 label="Search Radius (km)"
//                 keyboardType="numeric"
//                 style={styles.input}
//                 theme={{
//                     ...paperTheme,
//                     colors: { ...paperTheme.colors, text: theme.text },
//                 }}
//                 value={geoRadius.toString()}
//                 onChangeText={(val) => setGeoRadius(parseInt(val) || 0)}
//             />
//         </View>
//     );

//     /******************************************************
//      *               Validation & Navigation
//      ******************************************************/
//     const validateCurrentSubStep = () => {
//         switch (subStep) {
//             // subStep=1 => photos => no strict validation required
//             case 2:
//                 // Validate Age Range
//                 if (!ageRange || ageRange.length < 2) {
//                     return 'Please enter a valid age range, e.g. "18,35".';
//                 }
//                 break;
//             case 4:
//                 // Validate Geo Radius
//                 if (!geoRadius || geoRadius <= 0) {
//                     return 'Please enter a valid radius.';
//                 }
//                 break;
//             default:
//                 break;
//         }
//         return null;
//     };

//     const handleNext = () => {
//         setLocalError(null);
//         const error = validateCurrentSubStep();
//         if (error) {
//             setLocalError(error);
//             return;
//         }

//         // Save to global context depending on subStep
//         if (subStep === 1) {
//             updateProfileInfo({ photos });
//         } else if (subStep === 2) {
//             updatePreferences({ ageRange });
//         } else if (subStep === 3) {
//             updatePreferences({ interests });
//         } else if (subStep === 4) {
//             updatePreferences({ geoRadius });
//         }

//         if (subStep < 4) {
//             goNextSubStep();
//         } else {
//             // Completed Step3 => go to Step4
//             goNextSubStep();
//             navigation.navigate('EmailStep4');
//         }
//     };

//     const handleBack = () => {
//         setLocalError(null);
//         goPrevSubStep();
//     };

//     const errorMessages = localError && (
//         <Text style={[styles.errorText, { color: theme.primary }]}>{localError}</Text>
//     );

//     const renderWizardSubStep = () => {
//         switch (subStep) {
//             case 1:
//                 return renderSubStep1();
//             case 2:
//                 return renderSubStep2();
//             case 3:
//                 return renderSubStep3();
//             case 4:
//                 return renderSubStep4();
//             default:
//                 return null;
//         }
//     };

//     return (
//         <SignUpLayout
//             title="Preferences"
//             subtitle="Let’s personalize your search."
//             progress={progress}
//             errorComponent={errorMessages}
//             canGoBack
//             onBack={handleBack}
//             onNext={handleNext}
//             // We have 4 sub-steps in Step3, so we label "Next"
//             nextLabel="Next"
//             theme={theme}
//         >
//             <View style={styles.formContainer}>
//                 {renderWizardSubStep()}
//             </View>
//         </SignUpLayout>
//     );
// }

// const styles = StyleSheet.create({
//     errorText: {
//         textAlign: 'center',
//         marginTop: 8,
//         marginBottom: 10,
//     },
//     formContainer: {
//         flex: 1,
//         marginTop: 10,
//         marginBottom: 10,
//     },
//     stepPanel: {
//         flex: 1,
//         padding: 16,
//         marginHorizontal: 8,
//         borderRadius: 12,
//         elevation: 3,
//         marginBottom: 10,
//         justifyContent: 'flex-start',
//         // subtle shadow & border
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.15,
//         shadowRadius: 3,
//         borderWidth: 1,
//         borderColor: 'rgba(0,0,0,0.08)',
//     },
//     panelHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     panelTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginLeft: 4,
//     },
//     panelSubtitle: {
//         fontSize: 14,
//         marginTop: 4,
//         flexWrap: 'wrap',
//     },
//     input: {
//         marginTop: 16,
//     },
//     /***********************************
//      *          PHOTO GRID
//      ***********************************/
//     photoGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-between',
//         marginTop: 12,
//     },
//     photoSlotWrapper: {
//         width: '48%', // ensures 2 columns across
//         aspectRatio: 1, // keeps square shape
//         marginBottom: 8,
//     },
//     photoSlot: {
//         flex: 1,
//         borderWidth: 1.5,
//         borderColor: '#ccc',
//         borderStyle: 'dashed',
//         borderRadius: 8,
//         justifyContent: 'center',
//         alignItems: 'center',
//         overflow: 'hidden', // for corners
//         backgroundColor: '#f0f0f0',
//         position: 'relative',
//     },
//     photoImage: {
//         width: '100%',
//         height: '100%',
//         resizeMode: 'cover',
//     },
//     removeButton: {
//         position: 'absolute',
//         top: 4,
//         right: 4,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         borderRadius: 12,
//         paddingHorizontal: 6,
//         paddingVertical: 2,
//         zIndex: 10,
//     },
//     removeButtonText: {
//         color: '#fff',
//         fontWeight: 'bold',
//         fontSize: 12,
//     },
//     photoPlaceholderText: {
//         fontSize: 16,
//         fontWeight: '600',
//     },
// });
