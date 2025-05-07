export const formatEmailToName = (email: string): string => {
  // Extract username from email (part before @)
  const username = email.split('@')[0];
  // Capitalize first letter and replace dots/underscores with spaces
  return username
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}; 