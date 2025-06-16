import { gql } from "@apollo/client";
import { apolloClient } from '../config/apollo';

// User interface matching the required fields only
export interface User {
  id: number;
  fullName?: string;
  dob?: string;
  sex?: string;
  address?: string;
  userType?: string;
  level?: string;
  email?: string;
  phoneNumber: string;
  avatarId?: string;
  avatar?: {
    id: string;
    url: string;
  };
}

const GET_USER = gql`
  query GetUser($id: Int!) {
    user(id: $id) {
      id
      fullName
      dob
      sex
      address
      userType
      level
      email
      phoneNumber
      avatarId
      avatar {
        id
        url
      }
    }
  }
`;

const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      id
      fullName
      email
      phoneNumber
    }
  }
`;

// User service functions
export const getUserById = async (id: number): Promise<User | null> => {
  try {
    console.log('Fetching user by ID:', id);
    
    const { data } = await apolloClient.query({
      query: GET_USER,
      variables: { id },
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    });

    console.log('User API response:', data);
    
    if (data && data.user) {
      const user = data.user;
      console.log('✅ User found:');
      console.log('📋 User details:');
      console.log('   - ID:', user.id);
      console.log('   - Full Name:', user.fullName || 'N/A');
      console.log('   - Email:', user.email || 'N/A');
      console.log('   - Phone:', user.phoneNumber);
      console.log('   - DOB:', user.dob || 'N/A');
      console.log('   - Sex:', user.sex || 'N/A');
      console.log('   - Address:', user.address || 'N/A');
      console.log('   - User Type:', user.userType || 'N/A');
      console.log('   - Level:', user.level || 'N/A');
      
      return user;
    }
    
    console.log('❌ User not found');
    return null;
  } catch (error) {
    console.error('💥 Error fetching user by ID:', error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log('Fetching all users');
    
    const { data } = await apolloClient.query({
      query: GET_ALL_USERS,
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    });

    console.log('All users API response:', data);
    
    if (data && data.users) {
      console.log(`✅ Found ${data.users.length} users:`);
      data.users.forEach((user: User, index: number) => {
        console.log(`${index + 1}. ${user.fullName || user.email || `User ${user.id}`} (ID: ${user.id})`);
      });
    }
    
    return data?.users || [];
  } catch (error) {
    console.error('💥 Error fetching all users:', error);
    return[];
  }
};

// Helper function to get user display name
export const getUserDisplayName = (user: User): string => {
  return user.fullName || user.email || `User ${user.id}`;
};

// Helper functions for AsyncStorage
export const saveUserToStorage = async (user: User): Promise<void> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('user', JSON.stringify(user));
    console.log('User saved to storage:', user.id);
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
};

export const getUserFromStorage = async (): Promise<User | null> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const storedUser = await AsyncStorage.getItem('user');
    
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    return null;
  }
};

export const getUserIdFromStorage = async (): Promise<number | null> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userId = await AsyncStorage.getItem('userId');
    
    if (userId) {
      return parseInt(userId, 10);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user ID from storage:', error);
    return null;
  }
};

export const saveUserIdToStorage = async (userId: number): Promise<void> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('userId', userId.toString());
    console.log('User ID saved to storage:', userId);
  } catch (error) {
    console.error('Error saving user ID to storage:', error);
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.multiRemove(['user', 'userId']);
    console.log('User data cleared from storage');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};
