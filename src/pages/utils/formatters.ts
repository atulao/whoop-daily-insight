import { format } from "date-fns";

// Helper function to format seconds into HH:MM
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "--:--";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

// Helper function to format date string into time (e.g., "h:mm a")
export const formatTime = (dateString: string | undefined): string => {
  if (!dateString) return "--:--";
  try {
    // Ensure the date string is treated as UTC if no timezone is specified,
    // or handle potential ISO strings appropriately.
    // Adding 'Z' if it's just a date might be needed depending on API response.
    // Example: const isoDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`;
    return format(new Date(dateString), "h:mm a");
  } catch (error) {
    console.error(`Error formatting time for input: ${dateString}`, error);
    return "--:--";
  }
};

// Add other shared formatting functions here as needed... 