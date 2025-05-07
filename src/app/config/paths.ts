export const CLOUD_STORAGE_PATHS = {
  photo: (eventId: string, photoFileName: string) =>
    `${eventId}/${photoFileName}`,
  logo: {
    event: (logoFileName: string) => `logos/events/${logoFileName}`,
    organization: (logoFileName: string) =>
      `logos/organizations/${logoFileName}`,
  },
}
