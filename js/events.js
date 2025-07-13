export const getEvents = async () => {
  const response = await fetch('data/events.json');
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
};

export const getEventById = async (id) => {
  const events = await getEvents();
  return events.find(event => event.id === Number(id)) || null;
}; 