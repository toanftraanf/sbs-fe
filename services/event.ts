import { apolloClient } from "@/config/apollo";
import { CREATE_EVENT, GET_ALL_EVENTS, JOIN_EVENT, LEAVE_EVENT } from "@/graphql";
import { EventFormData } from "@/types";
import { formatDateToISO } from "@/utils/dateUtils";

interface CreateEventInput {
  title: string;
  sports: number[];
  date: string; // ISO datetime string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  stadiumId: number;
  coachId?: number;
  maxParticipants: number;
  description?: string;
  additionalNotes?: string;
  isSharedCost: boolean;
  isPrivate: boolean;
}

interface CreateEventResponse {
  createEvent: {
    id: string;
    title: string;
    description: string;
    additionalNotes: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    maxParticipants: number;
    isPrivate: boolean;
    isSharedCost: boolean;
    stadium: {
      id: number;
      name: string;
      address: string;
    };
    coach?: {
      id: string;
      bio: string;
      hourlyRate: number;
      user: {
        id: string;
        fullName: string;
        phoneNumber: string;
      };
    };
    coachBooking?: {
      id: string;
      totalPrice: number;
      status: string;
    };
    creator: {
      id: string;
      fullName: string;
      phoneNumber: string;
    };
    sports: {
      id: number;
      name: string;
      description: string;
    }[];
    participants: {
      id: string;
      status: string;
      joinedAt: string;
      user: {
        id: string;
        fullName: string;
        phoneNumber: string;
      };
    }[];
    createdAt: string;
    updatedAt: string;
  };
}

// Add interface for user events response
interface UserEvent {
  id: string;
  title: string;
  description: string;
  additionalNotes: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  isPrivate: boolean;
  isSharedCost: boolean;
  stadium: {
    id: number;
    name: string;
    address: string;
    avatarUrl?: string;
  };
  coach?: {
    id: string;
    bio: string;
    hourlyRate: number;
    user: {
      id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
  creator: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  sports: {
    id: number;
    name: string;
  }[];
  participants: {
    id: string;
    status: string;
    joinedAt: string;
    user: {
      id: string;
      fullName: string;
      phoneNumber: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

class EventService {
  private static instance: EventService;

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  public async createEvent(eventData: EventFormData): Promise<CreateEventResponse> {
    try {
      // Format the data for the GraphQL mutation
      const input: CreateEventInput = {
        title: eventData.eventTitle.trim(),
        sports: eventData.selectedSports,
        date: formatDateToISO(eventData.eventDate!), // Use local timezone formatting like stadium booking
        startTime: this.formatTimeToHHMM(eventData.startTime!),
        endTime: this.formatTimeToHHMM(eventData.endTime!),
        stadiumId: parseInt(eventData.selectedStadium!.id.toString()),
        coachId: eventData.selectedCoach?.id ? parseInt(eventData.selectedCoach.id) : undefined,
        maxParticipants: parseInt(eventData.maxParticipants),
        description: eventData.description || undefined,
        additionalNotes: eventData.additionalNotes || undefined,
        isSharedCost: eventData.isSharedCost,
        isPrivate: eventData.isPrivate,
      };

      console.log("🚀 Creating event with input:", input);

      const { data } = await apolloClient.mutate<CreateEventResponse>({
        mutation: CREATE_EVENT,
        variables: { input },
      });

      if (!data?.createEvent) {
        throw new Error("No data returned from createEvent mutation");
      }

      console.log("✅ Event created successfully:", data.createEvent);
      return data;
    } catch (error) {
      console.error("❌ Error creating event:", error);
      throw error;
    }
  }

  private formatTimeToHHMM(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  public async getAllEvents(): Promise<UserEvent[]> {
    try {
      console.log("🔍 Fetching all events");
      
      const { data } = await apolloClient.query({
        query: GET_ALL_EVENTS,
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      });

      if (data?.events) {
        console.log("✅ All events fetched:", data.events.length);
        return data.events;
      }

      console.log("⚠️ No events found");
      return [];

    } catch (error) {
      console.error("❌ Error fetching events:", error);
      return [];
    }
  }

  public async joinEvent(eventId: string): Promise<boolean> {
    try {
      console.log("🚀 Joining event:", eventId);

      const { data } = await apolloClient.mutate({
        mutation: JOIN_EVENT,
        variables: { eventId },
      });

      if (data?.joinEvent) {
        console.log("✅ Successfully joined event:", data.joinEvent);
        return true;
      }

      throw new Error("No data returned from joinEvent mutation");
    } catch (error) {
      console.error("❌ Error joining event:", error);
      throw error;
    }
  }

  public async leaveEvent(eventId: string): Promise<boolean> {
    try {
      console.log("🚀 Leaving event:", eventId);

      const { data } = await apolloClient.mutate({
        mutation: LEAVE_EVENT,
        variables: { eventId },
      });

      if (data?.leaveEvent) {
        console.log("✅ Successfully left event");
        return true;
      }

      throw new Error("No data returned from leaveEvent mutation");
    } catch (error) {
      console.error("❌ Error leaving event:", error);
      throw error;
    }
  }
}

export default EventService.getInstance();

export { UserEvent };

