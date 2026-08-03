// navigation/RootNavigator.tsx
// Switches between Auth / Admin / Teacher / Student stacks based on
// AuthContext.user.role. Phase 1 builds the real AuthStack; the
// role stacks below are placeholders wired for Phase 2-4.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import AuthStack from './AuthStack';
import AdminStack from './AdminStack';
import TeacherStack from './TeacherStack';
import StudentStack from './StudentStack';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : user.role === 'admin' ? (
          <Stack.Screen name="Admin" component={AdminStack} />
        ) : user.role === 'teacher' ? (
          <Stack.Screen name="Teacher" component={TeacherStack} />
        ) : (
          <Stack.Screen name="Student" component={StudentStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
