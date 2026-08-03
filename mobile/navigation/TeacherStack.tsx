import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherHomeScreen from '../screens/teacher/TeacherHomeScreen';

const Stack = createNativeStackNavigator();

export default function TeacherStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} options={{ title: 'Teacher' }} />
    </Stack.Navigator>
  );
}
