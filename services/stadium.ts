// src/services/stadium.ts
import env from "@/config/env";
import {
  CREATE_STADIUM,
  CREATE_STADIUM_WITH_STEPS,
  DELETE_STADIUM,
  GET_ALL_STADIUMS,
  GET_STADIUM_BY_ID,
  GET_STADIUMS_BY_ADDRESS,
  GET_STADIUMS_BY_NAME,
  GET_STADIUMS_BY_USER,
  UPDATE_STADIUM,
  UPDATE_STADIUM_BANK,
  UPDATE_STADIUM_IMAGES,
} from "@/graphql";
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

// Get all stadiums
export async function getAllStadiums(): Promise<Stadium[]> {
  console.log('Fetching all stadiums');
  try {
    const data = await graphqlRequest(GET_ALL_STADIUMS.loc?.source.body || "", {});
    console.log('All stadiums response data:', JSON.stringify(data, null, 2));
    return data.stadiums;
  } catch (error) {
    console.error('Error fetching all stadiums:', error);
    throw error;
  }
}

// Get stadium by ID
export async function getStadiumById(id: number): Promise<Stadium> {
  console.log('Fetching stadium for id:', id);
  try {
    const data = await graphqlRequest(GET_STADIUM_BY_ID.loc?.source.body || "", { id });
    console.log('Stadium response data:', JSON.stringify(data, null, 2));
    return data.stadium;
  } catch (error) {
    console.error('Error fetching stadium:', error);
    throw error;
  }
}

// Get stadiums by user ID
export async function getStadiumsByUser(userId: number): Promise<Stadium[]> {
  console.log('Fetching stadiums for userId:', userId);
  try {
    const data = await graphqlRequest(GET_STADIUMS_BY_USER.loc?.source.body || "", { userId });
    console.log('Response data:', JSON.stringify(data, null, 2));
    return data.stadiumsByUser;
  } catch (error) {
    console.error('Error fetching stadiums:', error);
    throw error;
  }
}

// Get stadiums by name
export async function getStadiumsByName(name: string): Promise<Stadium[]> {
  console.log('Fetching stadiums by name:', name);
  try {
    const data = await graphqlRequest(GET_STADIUMS_BY_NAME.loc?.source.body || "", { name });
    console.log('Stadiums by name response data:', JSON.stringify(data, null, 2));
    return data.stadiumsByName;
  } catch (error) {
    console.error('Error fetching stadiums by name:', error);
    throw error;
  }
}

// Get stadiums by address
export async function getStadiumsByAddress(searchAddress: string): Promise<Stadium[]> {
  console.log('Fetching stadiums by address:', searchAddress);
  try {
    const data = await graphqlRequest(GET_STADIUMS_BY_ADDRESS.loc?.source.body || "", { 
      input: { address: searchAddress }
    });
    console.log('Stadiums by address response data:', JSON.stringify(data, null, 2));
    return data.stadiumsByAddress;
  } catch (error) {
    console.error('Error fetching stadiums by address:', error);
    throw error;
  }
}

// Create stadium
export async function createStadium(input: any): Promise<Stadium> {
  console.log('Creating stadium:', input);
  try {
    const data = await graphqlRequest(CREATE_STADIUM.loc?.source.body || "", {
      createStadiumInput: input
    });
    console.log('Create stadium response:', JSON.stringify(data, null, 2));
    return data.createStadium;
  } catch (error) {
    console.error('Error creating stadium:', error);
    throw error;
  }
}

// Create stadium with steps
export async function createStadiumWithSteps(input: any): Promise<Stadium> {
  console.log('Creating stadium with steps:', input);
  try {
    const data = await graphqlRequest(CREATE_STADIUM_WITH_STEPS.loc?.source.body || "", {
      createStadiumStepsInput: input
    });
    console.log('Create stadium with steps response:', JSON.stringify(data, null, 2));
    return data.createStadiumWithSteps;
  } catch (error) {
    console.error('Error creating stadium with steps:', error);
    throw error;
  }
}

// Update stadium
export async function updateStadium(input: {
  id: number;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  googleMap?: string;
  phone?: string;
  email?: string;
  website?: string;
  otherContacts?: string[];
  description?: string;
  startTime?: string;
  endTime?: string;
  otherInfo?: string;
  sports?: string[];
  fields?: string[];
}): Promise<Stadium> {
  console.log('Updating stadium:', input);
  try {
    const data = await graphqlRequest(UPDATE_STADIUM.loc?.source.body || "", {
      updateStadiumInput: input
    });
    console.log('Update stadium response:', JSON.stringify(data, null, 2));
    return data.updateStadium;
  } catch (error) {
    console.error('Error updating stadium:', error);
    throw error;
  }
}

// Update stadium bank info
export async function updateStadiumBank(params: {
  id: number;
  bank: string;
  accountName: string;
  accountNumber: string;
  otherPayments: string[];
  pricingImages: string[];
}) {
  console.log('Updating stadium bank info:', params);
  try {
    const { id, otherPayments, ...input } = params; // Extract otherPayments but don't send to backend
    const data = await graphqlRequest(UPDATE_STADIUM_BANK.loc?.source.body || "", {
      id,
      input
    });
    console.log('Update stadium bank response:', JSON.stringify(data, null, 2));
    return data.updateStadiumBank;
  } catch (error) {
    console.error('Error updating stadium bank info:', error);
    throw error;
  }
}

// Update stadium images
export async function updateStadiumImages(input: {
  id: number;
  avatarUrl: string;
  bannerUrl: string;
  galleryUrls: string[];
}) {
  console.log('Updating stadium images:', input);
  try {
    const { id, ...imageInput } = input;
    const data = await graphqlRequest(UPDATE_STADIUM_IMAGES.loc?.source.body || "", {
      id,
      input: imageInput
    });
    console.log('Update stadium images response:', JSON.stringify(data, null, 2));
    return data.updateStadiumImages;
  } catch (error) {
    console.error('Error updating stadium images:', error);
    throw error;
  }
}

// Delete stadium
export async function deleteStadium(id: number): Promise<Stadium> {
  console.log('Deleting stadium:', id);
  try {
    const data = await graphqlRequest(DELETE_STADIUM.loc?.source.body || "", { id });
    console.log('Delete stadium response:', JSON.stringify(data, null, 2));
    return data.removeStadium;
  } catch (error) {
    console.error('Error deleting stadium:', error);
    throw error;
  }
}

// Legacy functions - keeping for backward compatibility
// These can be removed once all components are updated to use the new functions

// Get stadiums with address search (legacy)
export async function getStadiumsWithSearch(searchAddress?: string): Promise<Stadium[]> {
  if (searchAddress) {
    return getStadiumsByAddress(searchAddress);
  }
  return getAllStadiums();
}

// Get stadiums by location (legacy)
export async function getStadiumsByLocation(address: string, radiusKm: number = 5): Promise<Stadium[]> {
  return getStadiumsByAddress(address);
}

// Legacy step functions - these might need to be updated based on your specific needs
export async function getStadiumStep1(id: number): Promise<StadiumStep1Data> {
  const stadium = await getStadiumById(id);
  return {
    id: stadium.id,
    name: stadium.name,
    googleMap: stadium.googleMap,
    address: stadium.address || "",
    latitude: stadium.latitude || 0,
    longitude: stadium.longitude || 0,
    phone: stadium.phone || "",
    email: stadium.email || "",
    website: stadium.website || "",
    otherContacts: stadium.otherContacts || [],
    description: stadium.description || "",
    startTime: stadium.startTime || "",
    endTime: stadium.endTime || "",
    otherInfo: stadium.otherInfo || "",
    sports: stadium.sports || [],
    fields: stadium.fields?.map(f => f.fieldName) || [],
  };
}

export async function getStadiumStep2(id: number): Promise<StadiumStep2Data> {
  const stadium = await getStadiumById(id);
  return {
    id: stadium.id,
    bank: stadium.bank || "",
    accountName: stadium.accountName || "",
    accountNumber: stadium.accountNumber || "",
    price: stadium.price,
    otherPayments: stadium.otherPayments || [],
    pricingImages: stadium.pricingImages || [],
  };
}

export async function getStadiumStep3(id: number): Promise<StadiumStep3Data> {
  const stadium = await getStadiumById(id);
  return {
    id: stadium.id,
    avatarUrl: stadium.avatarUrl || "",
    bannerUrl: stadium.bannerUrl || "",
    galleryUrls: stadium.galleryUrls || [],
  };
}

// Legacy create functions
export async function createStadiumStep1(input: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  googleMap?: string;
  phone: string;
  email: string;
  website: string;
  otherContacts: string[];
  description: string;
  startTime: string;
  endTime: string;
  otherInfo: string;
  sports: string[];
  fields: string[];
}) {
  return createStadium({
    ...input,
    fields: input.fields.map(fieldName => ({ fieldName }))
  });
}

export async function updateStadiumStep2(params: {
  id: number;
  bank: string;
  accountName: string;
  accountNumber: string;
  otherPayments: string[];
  pricingImages: string[];
}) {
  return updateStadiumBank(params);
}

export const updateStadiumStep3 = async (input: {
  id: number;
  avatarUrl: string;
  bannerUrl: string;
  galleryUrls: string[];
}) => {
  return updateStadiumImages(input);
};
