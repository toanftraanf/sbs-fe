import { ApolloClient } from '@apollo/client';
import { GENERATE_UPLOAD_URL } from '../graphql';

export const testUploadUrl = async (apolloClient: ApolloClient<any>) => {
  try {
    console.log('🧪 Testing generateUploadUrl mutation...');
    
    const testInput = {
      fileName: 'test_image.jpg',
      type: 'image/jpeg',
      folder: 'test'
    };
    
    console.log('📤 Sending request with:', testInput);
    
    const result = await apolloClient.mutate({
      mutation: GENERATE_UPLOAD_URL,
      variables: {
        fileUploadInput: testInput,
      },
      errorPolicy: 'all', // Get both data and errors
    });
    
    console.log('📥 Full response:', JSON.stringify(result, null, 2));
    console.log('📋 Data:', result.data);
    console.log('❌ Errors:', result.errors);
    console.log('🔍 Loading:', result.loading);
    
    if (result.errors) {
      console.log('🚨 GraphQL Errors found:');
      result.errors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, {
          message: error.message,
          path: error.path,
          extensions: error.extensions,
          locations: error.locations,
        });
      });
    }
    
    if (result.data?.generateUploadUrl) {
      console.log('✅ Upload URL generation successful');
      console.log('📊 Upload info:', result.data.generateUploadUrl);
    } else {
      console.log('❌ No upload URL data returned');
    }
    
    return result;
  } catch (error) {
    console.log('💥 Exception caught:', error);
    console.log('🔧 Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
};

// Test network connectivity
export const testNetworkConnection = async (apolloClient: ApolloClient<any>) => {
  try {
    console.log('🌐 Testing network connection...');
    
    // Try a simpler query first (if you have one)
    // For now, let's check the Apollo Client configuration
    console.log('🔧 Apollo Client configuration:', {
      link: apolloClient.link,
      cache: apolloClient.cache,
      defaultOptions: apolloClient.defaultOptions,
    });
    
    console.log('💾 Current cache state:', apolloClient.cache.extract());
    
  } catch (error) {
    console.log('❌ Network test failed:', error);
  }
}; 