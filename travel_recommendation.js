// Global variable to store API data
let travelData = null;

// Load travel data when page loads
document.addEventListener('DOMContentLoaded', function () {
  loadTravelData();
});

// Function to load travel data from JSON file
async function loadTravelData() {
  try {
    const response = await fetch('travel_recommendation_api.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    travelData = await response.json();
    console.log('Travel data loaded successfully:', travelData);
  } catch (error) {
    console.error('Error loading travel data:', error);
    displayError(
      'Failed to load travel recommendations. Please try again later.'
    );
  }
}

// Function to show different sections
function showSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('.section');
  sections.forEach((section) => section.classList.remove('active'));

  // Show selected section
  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Show/hide search container based on section
  const searchContainer = document.getElementById('searchContainer');
  if (sectionName === 'home') {
    searchContainer.style.display = 'flex';
  } else {
    searchContainer.style.display = 'none';
  }

  // Clear search results when navigating away from home
  if (sectionName !== 'home') {
    clearResults();
  }
}

// Function to search for travel recommendations
function searchRecommendations() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (!searchTerm) {
    alert('Please enter a search term');
    return;
  }

  if (!travelData) {
    displayError('Travel data not loaded yet. Please try again in a moment.');
    return;
  }

  console.log('Searching for:', searchTerm);

  // Normalize search term and determine category
  const results = getSearchResults(searchTerm);

  if (results.length === 0) {
    displayNoResults(searchTerm);
  } else {
    displayResults(results);
  }
}

// Function to get search results based on keyword
function getSearchResults(searchTerm) {
  const results = [];

  // Normalize search term
  const normalizedTerm = searchTerm.toLowerCase();

  // Check for beach keywords
  const beachKeywords = ['beach', 'beaches', 'shore', 'coast', 'seaside'];
  if (beachKeywords.some((keyword) => normalizedTerm.includes(keyword))) {
    results.push(...travelData.beaches);
  }

  // Check for temple keywords
  const templeKeywords = [
    'temple',
    'temples',
    'shrine',
    'monastery',
    'religious',
  ];
  if (templeKeywords.some((keyword) => normalizedTerm.includes(keyword))) {
    results.push(...travelData.temples);
  }

  // Check for country keywords
  const countryKeywords = ['country', 'countries', 'nation', 'city', 'cities'];
  if (countryKeywords.some((keyword) => normalizedTerm.includes(keyword))) {
    // Add all cities from all countries
    travelData.countries.forEach((country) => {
      results.push(...country.cities);
    });
  }

  // Check for specific country names
  travelData.countries.forEach((country) => {
    if (normalizedTerm.includes(country.name.toLowerCase())) {
      results.push(...country.cities);
    }

    // Also check individual city names
    country.cities.forEach((city) => {
      if (city.name.toLowerCase().includes(normalizedTerm)) {
        results.push(city);
      }
    });
  });

  // Check for specific beach names
  travelData.beaches.forEach((beach) => {
    if (beach.name.toLowerCase().includes(normalizedTerm)) {
      results.push(beach);
    }
  });

  // Check for specific temple names
  travelData.temples.forEach((temple) => {
    if (temple.name.toLowerCase().includes(normalizedTerm)) {
      results.push(temple);
    }
  });

  // Remove duplicates based on name
  const uniqueResults = results.filter(
    (item, index, self) => index === self.findIndex((t) => t.name === item.name)
  );

  return uniqueResults;
}

// Function to display search results
function displayResults(results) {
  const searchResults = document.getElementById('searchResults');

  let html =
    '<div class="container"><h2 style="color: white; margin-bottom: 2rem; text-align: center;">Search Results</h2>';
  html += '<div class="results-container">';

  results.forEach((item) => {
    // Get a placeholder image URL based on the destination
    const imageUrl = getPlaceholderImage(item.name);

    html += `
            <div class="result-card">
                <img src="${imageUrl}" alt="${
      item.name
    }" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
                <div class="card-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    ${getTimeZoneInfo(item.name)}
                </div>
            </div>
        `;
  });

  html += '</div></div>';
  searchResults.innerHTML = html;

  // Scroll to results
  searchResults.scrollIntoView({ behavior: 'smooth' });
}

// Function to get appropriate placeholder images
function getPlaceholderImage(destinationName) {
  const name = destinationName.toLowerCase();

  // Beach destinations
  if (name.includes('bora bora')) {
    return 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('copacabana')) {
    return 'https://images.unsplash.com/photo-1544550581-5676d7ad7e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  }

  // Temples
  if (name.includes('angkor wat')) {
    return 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('taj mahal')) {
    return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  }

  // Cities
  if (name.includes('sydney')) {
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('melbourne')) {
    return 'https://images.unsplash.com/photo-1514395462725-fb4566210144?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('tokyo')) {
    return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('kyoto')) {
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('rio')) {
    return 'https://images.unsplash.com/photo-1544550581-5676d7ad7e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('são paulo') || name.includes('sao paulo')) {
    return 'https://images.unsplash.com/photo-1554478297-560703c26dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  }

  // Default travel image
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
}

// Function to get timezone information for destinations
function getTimeZoneInfo(destinationName) {
  const name = destinationName.toLowerCase();
  let timeZone = '';
  let country = '';

  // Determine timezone based on destination
  if (name.includes('sydney') || name.includes('melbourne')) {
    timeZone = 'Australia/Sydney';
    country = 'Australia';
  } else if (name.includes('tokyo') || name.includes('kyoto')) {
    timeZone = 'Asia/Tokyo';
    country = 'Japan';
  } else if (
    name.includes('rio') ||
    name.includes('são paulo') ||
    name.includes('sao paulo') ||
    name.includes('copacabana')
  ) {
    timeZone = 'America/Sao_Paulo';
    country = 'Brazil';
  } else if (name.includes('bora bora')) {
    timeZone = 'Pacific/Tahiti';
    country = 'French Polynesia';
  } else if (name.includes('angkor wat')) {
    timeZone = 'Asia/Phnom_Penh';
    country = 'Cambodia';
  } else if (name.includes('taj mahal')) {
    timeZone = 'Asia/Kolkata';
    country = 'India';
  }

  if (timeZone) {
    try {
      const options = {
        timeZone: timeZone,
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      const localTime = new Date().toLocaleString('en-US', options);
      return `<div class="time-info">📍 Current time in ${country}: ${localTime}</div>`;
    } catch (error) {
      console.error('Error getting timezone info:', error);
      return '';
    }
  }

  return '';
}

// Function to display no results message
function displayNoResults(searchTerm) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = `
        <div class="container">
            <div style="color: white; text-align: center; padding: 2rem;">
                <h2>No results found for "${searchTerm}"</h2>
                <p>Try searching for "beaches", "temples", or "countries" to discover amazing destinations!</p>
                <div style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
                    <p>Popular searches: beach, temple, country, Australia, Japan, Brazil</p>
                </div>
            </div>
        </div>
    `;
}

// Function to display error messages
function displayError(message) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = `
        <div class="container">
            <div style="color: white; text-align: center; padding: 2rem;">
                <h2>Error</h2>
                <p>${message}</p>
            </div>
        </div>
    `;
}

// Function to clear search results
function clearResults() {
  const searchResults = document.getElementById('searchResults');
  const searchInput = document.getElementById('searchInput');

  searchResults.innerHTML = '';
  searchInput.value = '';

  console.log('Search results cleared');
}

// Function to handle form submission
function submitForm(event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  // Simple form validation
  if (!name || !email || !message) {
    alert('Please fill in all fields');
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }

  // Simulate form submission
  alert(
    `Thank you, ${name}! Your message has been received. We'll get back to you at ${email} soon.`
  );

  // Reset form
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('message').value = '';
}

// Handle Enter key in search input
document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
        searchRecommendations();
      }
    });
  }
});

// Add smooth scrolling for navigation
function smoothScroll(target) {
  document.querySelector(target).scrollIntoView({
    behavior: 'smooth',
  });
}

// Log successful script loading
console.log('Travel Recommendation JavaScript loaded successfully');
