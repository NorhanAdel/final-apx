// app/graphql/query/event.queries.ts

export const GET_ALL_EVENTS = `
  query GetAllEvents($skip: Int, $take: Int) {
    events(skip: $skip, take: $take) {
      id
      title
      description
      event_type
      sport_id
      location
      image_url
      date_start
      date_end
      max_participants
      status
      created_at
      updated_at
    }
  }
`;

export const GET_EVENTS_BY_STATUS = `
  query GetEventsByStatus($status: EventStatus!, $skip: Int, $take: Int) {
    eventsByStatus(status: $status, skip: $skip, take: $take) {
      id
      title
      description
      event_type
      sport_id
      location
      image_url
      date_start
      date_end
      max_participants
      status
      created_at
      updated_at
    }
  }
`;

export const GET_EVENTS_BY_SPORT = `
  query GetEventsBySport($sportId: ID!, $skip: Int, $take: Int) {
    eventsBySport(sportId: $sportId, skip: $skip, take: $take) {
      id
      title
      description
      event_type
      sport_id
      location
      image_url
      date_start
      date_end
      max_participants
      status
      created_at
      updated_at
    }
  }
`;

export const GET_EVENT_BY_ID = `
  query GetEventById($id: ID!) {
    event(id: $id) {
      id
      title
      description
      event_type
      sport_id
      location
      image_url
      date_start
      date_end
      max_participants
      status
      created_at
      updated_at
    }
  }
`;

export const GET_MY_EVENT_REGISTRATIONS = `
  query GetMyEventRegistrations {
    myEventRegistrations {
      id
      event_id
      event {
        id
        title
        description
        event_type
        location
        image_url
        date_start
        status
      }
      status
      registered_at
    }
  }
`;

export const SEARCH_EVENTS = `
  query SearchEvents($searchTerm: String!) {
    searchEvents(searchTerm: $searchTerm) {
      id
      title
      description
      event_type
      location
      image_url
      date_start
      status
    }
  }
`;

export const GET_MY_EVENTS = `
  query GetMyEvents {
    myEvents {
      id
      title
      description
      event_type
      location
      image_url
      date_start
      date_end
      max_participants
      status
      organizer_id
      sport_id
      created_at
      updated_at
    }
  }
`;

export const GET_EVENT_REGISTRATIONS = `
  query GetEventRegistrations($eventId: ID!) {
    eventRegistrations(eventId: $eventId) {
      id
      status
      player_id
      registered_at
      player {
        id
        first_name
        last_name
        profile_image_url
      }
    }
  }
`;

export const GET_MY_EVENTS_WITH_REGISTRATIONS = `
  query GetMyEventsWithRegistrations {
    myEvents {
      id
      title
      description
      event_type
      location
      image_url
      date_start
      date_end
      max_participants
      status
      organizer_id
      sport_id
      created_at
      updated_at
      registrations {
        id
        status
        player_id
        registered_at
        player {
          id
          first_name
          last_name
          profile_image_url
        }
      }
    }
  }
`;
