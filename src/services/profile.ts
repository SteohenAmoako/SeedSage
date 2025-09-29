import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  username: string;
}

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
};

export const saveProfile = async (userId: string, profile: UserProfile): Promise<boolean> => {
  try {
    await setDoc(doc(db, 'profiles', userId), profile, { merge: true });
    return true;
  } catch (error) {
    console.error('Error writing document:', error);
    return false;
  }
};
