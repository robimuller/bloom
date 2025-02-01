// You can place this in a separate utility file (e.g., utils/uploadImage.js)
// or directly in your SettingsScreen.js file

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// If you have exported the storage instance from your config file, you can import it:
// import { storage } from '../../config/firebase';

async function uploadImageAsync(uri) {
    // Convert the local URI to a blob
    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(xhr.response);
        };
        xhr.onerror = function (e) {
            console.error(e);
            reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
    });

    // Get a reference to Firebase Storage (using your already initialized storage instance)
    const storageInstance = getStorage(); // or use your imported "storage"

    // Create a unique filename or path. Here, we use a timestamp.
    const filename = `userImages/${Date.now()}.jpg`;
    const storageRef = ref(storageInstance, filename);

    // Upload the blob to Firebase Storage
    await uploadBytes(storageRef, blob);

    // It's good practice to close the blob when done
    blob.close();

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

export default uploadImageAsync;