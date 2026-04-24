export const REGISTER_TO_EVENT = `
  mutation RegisterToEvent($input: CreateEventRegistrationInput!) {
    registerToEvent(input: $input) {
      id
      event_id
      status
      registered_at
    }
  }
`;

export const CANCEL_REGISTRATION = `
  mutation CancelRegistration($id: ID!) {
    cancelRegistration(id: $id)
  }
`;

// app/graphql/mutation/event.mutations.ts
export const CREATE_EVENT = `
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
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
      created_at
      updated_at
    }
  }
`;

export const UPDATE_EVENT = `
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
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
      created_at
      updated_at
    }
  }
`;

export const DELETE_EVENT = `
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export const CANCEL_EVENT = `
  mutation CancelEvent($id: ID!) {
    cancelEvent(id: $id) {
      id
      status
    }
  }
`;

export const UPDATE_REGISTRATION_STATUS = `
  mutation UpdateRegistrationStatus($id: ID!, $input: UpdateEventRegistrationInput!) {
    updateRegistrationStatus(id: $id, input: $input) {
      id
      status
    }
  }
`;