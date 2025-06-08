// src/services/stadium.ts
import env from "@/config/env";
import { Stadium, StadiumStep1Data, StadiumStep2Data, StadiumStep3Data } from "@/types";

const GRAPHQL_URL = env.API_BASE_URL + "/graphql";

async function graphqlRequest(query: string, variables: Record<string, any>) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// Get stadiums by user ID
export async function getStadiumsByUser(userId: number): Promise<Stadium[]> {
  console.log('Fetching stadiums for userId:', userId);
  const query = `
    query GetStadiumsByUser($userId: Int!) {
      stadiumsByUser(userId: $userId) {
        id
        name
        googleMap
        phone
        email
        website
        otherContacts
        description
        startTime
        endTime
        otherInfo
        sports
        bank
        accountName
        accountNumber
        otherPayments
        pricingImages
        avatarUrl
        bannerUrl
        galleryUrls
      }
    }
  `;
  try {
    const data = await graphqlRequest(query, { userId });
    console.log('Response data:', JSON.stringify(data, null, 2));
    return data.stadiumsByUser;
  } catch (error) {
    console.error('Error fetching stadiums:', error);
    throw error;
  }
}

// Fetch functions
export async function getStadiumStep1(id: number): Promise<StadiumStep1Data> {
  console.log('Fetching stadium step 1 for id:', id);
  const query = `
    query GetStadiumStep1($id: Int!) {
      stadiumsByUser(userId: $id) {
        id
        name
        googleMap
        phone
        email
        website
        otherContacts
        description
        startTime
        endTime
        otherInfo
        sports
      }
    }
  `;
  try {
    const data = await graphqlRequest(query, { id });
    console.log('Step 1 response data:', JSON.stringify(data, null, 2));
    return data.stadiumsByUser[0];
  } catch (error) {
    console.error('Error fetching stadium step 1:', error);
    throw error;
  }
}

export async function getStadiumStep2(id: number): Promise<StadiumStep2Data> {
  console.log('Fetching stadium step 2 for id:', id);
  const query = `
    query GetStadiumStep2($id: Int!) {
      stadiumsByUser(userId: $id) {
        id
        bank
        accountName
        accountNumber
        otherPayments
        pricingImages
      }
    }
  `;
  try {
    const data = await graphqlRequest(query, { id });
    console.log('Step 2 response data:', JSON.stringify(data, null, 2));
    return data.stadiumsByUser[0];
  } catch (error) {
    console.error('Error fetching stadium step 2:', error);
    throw error;
  }
}

export async function getStadiumStep3(id: number): Promise<StadiumStep3Data> {
  console.log('Fetching stadium step 3 for id:', id);
  const query = `
    query GetStadiumStep3($id: Int!) {
      stadiumsByUser(userId: $id) {
        id
        avatarUrl
        bannerUrl
        galleryUrls
      }
    }
  `;
  try {
    const data = await graphqlRequest(query, { id });
    console.log('Step 3 response data:', JSON.stringify(data, null, 2));
    return data.stadiumsByUser[0];
  } catch (error) {
    console.error('Error fetching stadium step 3:', error);
    throw error;
  }
}

export async function createStadiumStep1(input: {
  name: string;
  googleMap: string;
  phone: string;
  email: string;
  website: string;
  otherContacts: string[];
  description: string;
  startTime: string;
  endTime: string;
  otherInfo: string;
  sports: string[];
}) {
  const mutation = `
    mutation CreateStadium($createStadiumInput: CreateStadiumInput!) {
      createStadium(createStadiumInput: $createStadiumInput) {
        id
      }
    }
  `;
  const data = await graphqlRequest(mutation, { createStadiumInput: input });
  return data.createStadium.id as number;
}

export async function updateStadiumStep2(params: {
  id: number;
  bank: string;
  accountName: string;
  accountNumber: string;
  otherPayments: string[];
  pricingImages: string[];
}) {
  const mutation = `
    mutation UpdateStadiumStep2($id: Int!, $input: UpdateStadiumBankInput!) {
      updateStadiumBank(id: $id, input: $input) {
        id
      }
    }
  `;
  return await graphqlRequest(mutation, {
    id: params.id,
    input: {
      id: params.id,
      bank: params.bank,
      accountName: params.accountName,
      accountNumber: params.accountNumber,
      otherPayments: params.otherPayments,
      pricingImages: params.pricingImages,
    },
  });
}

export const updateStadiumStep3 = async (input: {
  id: number;
  avatarUrl: string;
  bannerUrl: string;
  galleryUrls: string[];
}) => {
  const mutation = `
    mutation UpdateStadiumImages($id: Int!, $input: UpdateStadiumImagesInput!) {
      updateStadiumImages(id: $id, input: $input) {
        id
        avatarUrl
        bannerUrl
        galleryUrls
      }
    }
  `;
  return await graphqlRequest(mutation, { 
    id: input.id,
    input: {
      avatarUrl: input.avatarUrl,
      bannerUrl: input.bannerUrl,
      galleryUrls: input.galleryUrls,
    },
  });
};
