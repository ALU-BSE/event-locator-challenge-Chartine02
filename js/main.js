const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const getCategoryBadgeClass = (category) => {
  const categoryMap = {
    'Music': 'category-music',
    'Sports': 'category-sports', 
    'Art': 'category-art',
    'Tech': 'category-tech'
  };
  return categoryMap[category] || 'category-tech';
};

const renderEventCard = (event, container) => {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4 mb-4';
  
  const categoryClass = getCategoryBadgeClass(event.category);
  
  col.innerHTML = `
    <div class="card event-card h-100">
      <div class="card-body d-flex flex-column">
        <div class="mb-3">
          <span class="category-badge ${categoryClass}">${event.category}</span>
        </div>
        <h5 class="card-title">${event.name}</h5>
        <h6 class="card-subtitle mb-2 text-muted">
          <i class="bi bi-calendar3 me-1"></i>${event.date}
        </h6>
        <p class="card-text flex-grow-1">${event.description}</p>
        <p class="card-text mb-3">
          <small class="text-muted">
            <i class="bi bi-geo-alt me-1"></i>${event.location}
          </small>
        </p>
        <a href="event-details.html?id=${event.id}" class="btn btn-outline-primary mt-auto">
          View Details
        </a>
      </div>
    </div>
  `;
  
  container.appendChild(col);
};

const renderEvents = async (events, containerId, title = 'Events') => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!events || events.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <h3>No events found</h3>
          <p>Try adjusting your search criteria or browse all events</p>
          <a href="events.html" class="btn btn-primary">Browse All Events</a>
        </div>
      </div>
    `;
    return;
  }
  
  events.forEach(event => renderEventCard(event, container));
};

const renderFeaturedEvents = async (events) => {
  const container = document.getElementById('featuredEvents');
  if (!container) return;
  
  const featured = events.slice(0, 3);
  await renderEvents(featured, 'featuredEvents');
};

const renderEventDetails = async (event) => {
  const details = document.getElementById('eventDetails');
  if (!details) return;
  
  if (!event) {
    details.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <h3>Event not found</h3>
        <p>The event you're looking for doesn't exist or has been removed.</p>
        <a href="events.html" class="btn btn-primary">Back to Events</a>
      </div>
    `;
    return;
  }
  
  const categoryClass = getCategoryBadgeClass(event.category);
  
  details.innerHTML = `
    <div class="card">
      <div class="card-body p-4">
        <div class="mb-3">
          <span class="category-badge ${categoryClass}">${event.category}</span>
        </div>
        <h2 class="card-title mb-3">${event.name}</h2>
        <div class="row mb-4">
          <div class="col-md-6">
            <h6 class="text-muted">
              <i class="bi bi-calendar3 me-2"></i>Date
            </h6>
            <p class="mb-0">${event.date}</p>
          </div>
          <div class="col-md-6">
            <h6 class="text-muted">
              <i class="bi bi-geo-alt me-2"></i>Location
            </h6>
            <p class="mb-0">${event.location}</p>
          </div>
        </div>
        <h6 class="text-muted mb-2">Description</h6>
        <p class="card-text mb-4">${event.description}</p>
        <div class="d-flex gap-2">
          <a href="events.html" class="btn btn-secondary">
            <i class="bi bi-arrow-left me-1"></i>Back to Events
          </a>
          <a href="index.html" class="btn btn-outline-primary">
            <i class="bi bi-house me-1"></i>Home
          </a>
        </div>
      </div>
    </div>
  `;
};

const handleHomeSearch = async (e) => {
  e.preventDefault();
  
  const search = document.getElementById('searchInput').value.trim();
  const date = document.getElementById('dateFilter').value;
  const category = document.getElementById('categoryFilter').value;
  
  const searchResults = document.getElementById('searchResults');
  const searchSection = document.getElementById('searchResultsSection');
  
  searchSection.style.display = 'block';
  searchResults.innerHTML = `
    <div class="col-12">
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  `;
  
  try {
    const { getEvents } = await import('./events.js');
    const allEvents = await getEvents();
    
    const filtered = filterEvents(allEvents, { search, date, category });
    
    searchSection.scrollIntoView({ behavior: 'smooth' });
    
    await renderEvents(filtered, 'searchResults');
    
  } catch (error) {
    searchResults.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <h3>Error loading events</h3>
          <p>Please try again later</p>
        </div>
      </div>
    `;
  }
};

const handleSearch = async (e) => {
  e.preventDefault();
  const search = document.getElementById('searchInput').value.trim();
  const date = document.getElementById('dateFilter').value;
  const category = document.getElementById('categoryFilter').value;
  
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (date) params.append('date', date);
  if (category) params.append('category', category);
  
  window.location.href = `events.html?${params.toString()}`;
};

const filterEvents = (events, { search, date, category }) => {
  return events.filter(event => {
    const matchesSearch = !search ||
      event.name.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !date || event.date === date;
    const matchesCategory = !category || event.category === category;
    return matchesSearch && matchesDate && matchesCategory;
  });
};

const clearSearch = () => {
  const searchSection = document.getElementById('searchResultsSection');
  const searchForm = document.getElementById('searchForm');
  
  if (searchSection) {
    searchSection.style.display = 'none';
  }
  
  if (searchForm) {
    searchForm.reset();
  }
};

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const { getEvents, getEventById } = await import('./events.js');

    const searchForm = document.getElementById('searchForm');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    if (searchForm) {
      const featuredEvents = document.getElementById('featuredEvents');
      
      if (featuredEvents) {
        searchForm.addEventListener('submit', handleHomeSearch);
        
        if (clearSearchBtn) {
          clearSearchBtn.addEventListener('click', clearSearch);
        }
        
        const allEvents = await getEvents();
        await renderFeaturedEvents(allEvents);
      } else {
        searchForm.addEventListener('submit', handleSearch);
      }
    }

    const eventsContainer = document.getElementById('eventsContainer');
    if (eventsContainer) {
      const allEvents = await getEvents();
      const search = getQueryParam('search') || '';
      const date = getQueryParam('date') || '';
      const category = getQueryParam('category') || '';
      const filtered = filterEvents(allEvents, { search, date, category });
      await renderEvents(filtered, 'eventsContainer');
    }

    const eventDetails = document.getElementById('eventDetails');
    if (eventDetails) {
      const id = getQueryParam('id');
      if (id) {
        const event = await getEventById(id);
        await renderEventDetails(event);
      }
    }
    
  } catch (error) {
    console.error('Error initializing app:', error);
    
    const containers = ['featuredEvents', 'eventsContainer', 'searchResults'];
    containers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div class="col-12">
            <div class="empty-state">
              <div class="empty-state-icon">⚠️</div>
              <h3>Error loading events</h3>
              <p>Please refresh the page and try again</p>
            </div>
          </div>
        `;
      }
    });
  }
}); 