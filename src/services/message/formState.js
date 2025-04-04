// Object to store form state for each user
export const userFormState = new Map();

// Form states
export const FORM_STATES = {
  IDLE: "idle",
  WAITING_NAME: "waiting_name",
  WAITING_BIRTHDATE: "waiting_birthdate",
  WAITING_BIRTHTIME: "waiting_birthtime",
  PROCESSING: "processing",
};
