// // src/screens/auth/emailWizard/EmailStep5.js

// import React, { useContext, useState } from 'react';
// import { View, StyleSheet, Alert } from 'react-native';
// import { Text } from 'react-native-paper';
// import { doc, updateDoc } from 'firebase/firestore';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// import { db } from '../../../../config/firebase';
// import { auth } from '../../../../config/firebase'; // or from your AuthContext
// import { AuthContext } from '../../../contexts/AuthContext';
// import { SignUpContext } from '../../../contexts/SignUpContext';
// import { ThemeContext } from '../../../contexts/ThemeContext';
// import { WizardContext } from '../../../contexts/WizardContext';

// import SignUpLayout from '../../../components/SignUpLayout';

// export default function EmailStep5({ navigation }) {
//     const { emailSignup, authError } = useContext(AuthContext);
//     const { theme } = useContext(ThemeContext);
//     const {
//         basicInfo,
//         profileInfo,
//         preferences,
//         permissions,
//     } = useContext(SignUpContext);

//     // Wizard state
//     const { subStep, progress, goPrevSubStep, goNextSubStep } = useContext(WizardContext);

//     const [localError, setLocalError] = useState(null);
//     const [loading, setLoading] = useState(false);

//     /******************************************************
//      *         Helper: Upload Photos to Firebase
//      ******************************************************/
//     const uploadPhotos = async (photosArray, userUid) => {
//         const storage = getStorage(); // from 'firebase/storage'
//         const photoURLs = [];

//         for (let i = 0; i < photosArray.length; i++) {
//             const localUri = photosArray[i];
//             if (!localUri) continue; // skip empty slots

//             // Convert file to blob
//             const response = await fetch(localUri);
//             const blob = await response.blob();

//             // Create storage ref: e.g. "user_photos/uid/photo_0.jpg"
//             const fileRef = ref(storage, `user_photos/${userUid}/photo_${i}.jpg`);

//             // Upload
//             await uploadBytes(fileRef, blob);
//             const downloadURL = await getDownloadURL(fileRef);
//             photoURLs.push(downloadURL);
//         }

//         return photoURLs;
//     };

//     /******************************************************
//      *         Final "Finish" Handler
//      ******************************************************/
//     const handleFinish = async () => {
//         setLocalError(null);
//         setLoading(true);

//         try {
//             // 1) Create user in Firebase Auth
//             const newUser = await emailSignup(
//                 basicInfo.email,
//                 basicInfo.password,
//                 basicInfo.firstName
//             );

//             // 2) If we got an authError, stop
//             if (authError) {
//                 setLocalError(authError);
//                 setLoading(false);
//                 return;
//             }

//             // 3) Upload photos if any
//             let finalPhotoURLs = [];
//             if (profileInfo.photos && profileInfo.photos.length > 0) {
//                 finalPhotoURLs = await uploadPhotos(profileInfo.photos, newUser.uid);
//             }

//             // 4) Update Firestore doc
//             await updateDoc(doc(db, 'users', newUser.uid), {
//                 birthday: profileInfo?.birthday || null,
//                 gender: profileInfo?.gender || null,
//                 orientation: profileInfo?.orientation || null,
//                 bio: profileInfo?.bio || null,

//                 ageRange: preferences?.ageRange || [18, 35],
//                 interests: preferences?.interests || [],
//                 geoRadius: preferences?.geoRadius || 50,

//                 notifications: permissions?.notifications || false,
//                 // location, etc. if you have them

//                 photos: finalPhotoURLs, // store the Storage download URLs
//                 onboardingComplete: true,
//                 updatedAt: new Date().toISOString(),
//             });

//             // 5) Advance wizard step (if you have more steps, or finish)
//             goNextSubStep();
//             setLoading(false);

//             Alert.alert('Success!', 'Your account has been created.', [
//                 {
//                     text: 'OK',
//                     onPress: () => {

//                         navigation.popToTop();
//                     },
//                 },
//             ]);
//         } catch (error) {
//             setLoading(false);
//             setLocalError(error.message);
//             console.error('Error finalizing onboarding:', error);
//         }
//     };

//     // If user taps back
//     const handleBack = () => {
//         setLocalError(null);
//         goPrevSubStep();
//         navigation.navigate('EmailStep4');
//     };

//     const errorMessages = (
//         <>
//             {authError ? (
//                 <Text style={[styles.errorText, { color: theme.primary }]}>
//                     {authError}
//                 </Text>
//             ) : null}
//             {localError ? (
//                 <Text style={[styles.errorText, { color: theme.primary }]}>
//                     {localError}
//                 </Text>
//             ) : null}
//         </>
//     );

//     return (
//         <SignUpLayout
//             title="Confirmation"
//             subtitle="Just one more click!"
//             progress={progress}
//             errorComponent={errorMessages}
//             canGoBack
//             onBack={handleBack}
//             onNext={handleFinish}
//             nextLabel={loading ? 'Finishing...' : 'Finish'}
//             theme={theme}
//         >
//             <View style={styles.formContainer}>
//                 <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
//                     <Text style={[styles.finalText, { color: theme.text }]}>
//                         Review your details and tap "Finish" to create your account.
//                     </Text>
//                 </View>
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
//         justifyContent: 'center',
//         alignItems: 'center',

//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.15,
//         shadowRadius: 3,
//         borderWidth: 1,
//         borderColor: 'rgba(0,0,0,0.08)',
//     },
//     finalText: {
//         fontSize: 16,
//         textAlign: 'center',
//     },
// });
