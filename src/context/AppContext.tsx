import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  hasLoggedToday: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    let unsubscribeLogs: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Student',
          targetExam: null
        });

        // Listen to Firestore for user metadata
        unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser(prev => prev ? {
              ...prev,
              targetExam: data.targetExam || null
            } : null);
          }
        });

        // Listen to Firestore for latest journal log to determine daily state
        const logsRef = collection(db, 'users', firebaseUser.uid, 'journal_logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(1));
        
        unsubscribeLogs = onSnapshot(q, (snap) => {
          if (snap.empty) {
            setHasLoggedToday(false);
          } else {
            const latestDoc = snap.docs[0].data();
            const timestamp = latestDoc.timestamp?.toDate 
              ? latestDoc.timestamp.toDate() 
              : new Date(latestDoc.timestamp || 0);
            
            const today = new Date();
            const isSameDay = timestamp.getDate() === today.getDate() &&
                              timestamp.getMonth() === today.getMonth() &&
                              timestamp.getFullYear() === today.getFullYear();
            setHasLoggedToday(isSameDay);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setHasLoggedToday(false);
        setLoading(false);
        
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
        if (unsubscribeLogs) {
          unsubscribeLogs();
          unsubscribeLogs = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
      if (unsubscribeLogs) unsubscribeLogs();
    };
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, loading, hasLoggedToday }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
