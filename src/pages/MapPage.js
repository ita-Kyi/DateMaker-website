import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import '../styles/MapPage.css';

/*
The API is suprisingly good and I didn't need to write any serious logic for it 


The only fucking thing that is pissing me off is the fucked up X on the info window, I have no idea why it is so hard to move or style,
I have tried everything, I have tried targeting the class with css, I have tried using the onLoad prop of the InfoWindow to get the close 
button element and style it directly with JS, I have tried using the options prop of the InfoWindow to set a custom close button, but 
nothing works, it is like google has some sort of voodoo magic on that close button to prevent it from being styled or moved, I'd sacrifice 
a goat like an african priest to make it not fucked up*/


const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Fallback map center (Mosonmagyarovar, Hungary).
const defaultCenter = {
  lat: 47.8673,
  lng: 17.2699,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'on' }],
    },
  ],
};

const MapPage = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [filterCategory, setFilterCategory] = useState('restaurant');
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationStatus, setLocationStatus] = useState('requesting');
  const [locationError, setLocationError] = useState(null);
  const mapRef = useRef(null);
  const placesServiceRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const categories = [
    { id: 'restaurant', label: 'Restaurants', icon: '🍽️', type: 'restaurant' },
    { id: 'bar', label: 'Bars', icon: '🍸', type: 'bar' },
    { id: 'cafe', label: 'Cafes', icon: '☕', type: 'cafe' },
    { id: 'movie_theater', label: 'Movies', icon: '🎬', type: 'movie_theater' },
    { id: 'park', label: 'Parks', icon: '🌳', type: 'park' },
    { id: 'bowling_alley', label: 'Activities', icon: '🎳', type: 'bowling_alley' },
  ];

  // Use the fallback city when geolocation is denied.
  const useDefaultLocation = () => {
    setCurrentLocation(defaultCenter);
    setLocationStatus('granted');
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setLocationStatus('denied');
      return;
    }

    //This the browser "Would like to use your location" popup
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('granted');
      },
      (error) => {
        console.error('Error getting location:', error);
        if (error.code === 1) {
          setLocationError('Location permission denied');
        } else if (error.code === 2) {
          setLocationError('Location unavailable (try HTTPS or allow in browser settings)');
        } else if (error.code === 3) {
          setLocationError('Location request timed out');
        }
        setLocationStatus('denied');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // Query Google Places around the current marker location.
  const searchNearbyPlaces = useCallback(() => {
    if (!placesServiceRef.current || !mapRef.current || !currentLocation) return;

    setIsLoading(true);
    const request = {
      location: currentLocation,
      radius: 3000,
      type: filterCategory,
    };
                //ok so I was shitting my pants that I'd have to write it but google api has a "nearbySearch" method that takes care of everything
                //First good thing google has done🥳
    placesServiceRef.current.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const formattedPlaces = results.map((place) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          rating: place.rating || 0,
          totalRatings: place.user_ratings_total || 0,
          priceLevel: place.price_level, //unemployed(0) to MrBeast(4)
          isOpen: place.opening_hours?.isOpen?.() ?? null,
          photo: place.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 300 }),
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          },
          types: place.types,
        }));
        setPlaces(formattedPlaces);
      } else {
        setPlaces([]);
      }
      setIsLoading(false);
    });
  }, [currentLocation, filterCategory]);

  useEffect(() => {
    if (mapLoaded) {
      searchNearbyPlaces();
    }
  }, [mapLoaded, filterCategory, currentLocation, searchNearbyPlaces]);

  // Store map and PlacesService refs after load.
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    setMapLoaded(true);
  }, []);

  const handleMarkerDragEnd = (e) => {
    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setCurrentLocation(newLocation);
  };

  const handleMapClick = (e) => {
    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setCurrentLocation(newLocation);
  };

  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
    if (mapRef.current) {
      mapRef.current.panTo(place.location);
    }
  };

  const getPriceLevel = (level) => {
    if (level === undefined || level === null) return 'N/A';
    return '$'.repeat(level + 1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    return stars;
  };

  const getDirectionsUrl = (place) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}&destination_place_id=${place.id}`;
  };

  // To enable maps locally, set REACT_APP_GOOGLE_MAPS_API_KEY in .env (Maps JS + Places enabled).
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="map-page">
        <div className="map-header">
          <h1>📍 Around Me</h1>
          <p>Find perfect date spots near your location</p>
        </div>

        <div className="map-controls">
          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-btn ${filterCategory === cat.id ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    );
  }


        {/* Not important for user, if you want to self try it  
        <div className="api-key-notice">
          <div className="notice-content">
            <span className="notice-icon">🔑</span>
            <h3>Google Maps API Key Required</h3>
            <p>To see nearby places on the map, please add your Google Maps API key:</p>
            <ol>
              <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Create or select a project</li>
              <li>Enable <strong>Maps JavaScript API</strong> and <strong>Places API</strong></li>
              <li>Create an API key</li>
              <li>Add to your <code>.env</code> file:</li>
            </ol>
            <code className="env-code">REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here</code>
            <p className="restart-note">Then restart your development server.</p>
          </div>
        </div>
        */}
  if (locationStatus === 'requesting') {
    return (
      <div className="map-page">
        <div className="map-header">
          <h1>📍 Around Me</h1>
          <p>Find perfect date spots near your location</p>
        </div>
        <div className="location-prompt">
          <div className="prompt-content">
            <span className="prompt-icon">📍</span>
            <h3>Waiting for Location Access</h3>
            <p>Please allow location access in your browser to find date spots near you.</p>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (locationStatus === 'denied') {
    return (
      <div className="map-page">
        <div className="map-header">
          <h1>📍 Around Me</h1>
          <p>Find perfect date spots near your location</p>
        </div>
        <div className="location-prompt">
          <div className="prompt-content">
            <span className="prompt-icon">�</span>
            <h3>Location Unavailable</h3>
            <p>{locationError || 'Could not get your location.'}</p>
            <p className="hint-text">This often happens on localhost without HTTPS.</p>
            <div className="prompt-buttons">
              <button className="retry-btn" onClick={() => window.location.reload()}>
                🔄 Try Again
              </button>
              <button className="fallback-btn" onClick={useDefaultLocation}>
                🗺️ Use Default Location (Mosonmagyarovar, Hungary)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>📍 Around Me</h1>
        <p>Find perfect date spots near your location</p>
      </div>

      <div className="map-controls">
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${filterCategory === cat.id ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat.id)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="map-content">
        <div className="map-container">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={currentLocation}
              zoom={14}
              options={mapOptions}
              onLoad={onMapLoad}
              onClick={handleMapClick}
            >
              <Marker
                position={currentLocation}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
                icon={{
                  path: 'M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
                  scale: 2,
                  fillColor: '#FF0000',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  anchor: window.google?.maps ? new window.google.maps.Point(12, 21) : undefined,
                }}
                title="Drag me or click map to search new area"
              />

              {places.map((place) => (
                <Marker
                  key={place.id}
                  position={place.location}
                  onClick={() => handleMarkerClick(place)}
                  icon={{
                    url: `data:image/svg+xml,${encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
                        <circle cx="12" cy="12" r="10" fill="#FF6B6B" stroke="#fff" stroke-width="2"/>
                        <text x="12" y="16" text-anchor="middle" fill="white" font-size="10">${categories.find(c => c.id === filterCategory)?.icon || '📍'}</text>
                      </svg>
                    `)}`,
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                />
              ))}

              {selectedPlace && (
                <InfoWindow
                  position={selectedPlace.location}
                  onCloseClick={() => setSelectedPlace(null)}
                >
                  <div className="info-window">
                    {selectedPlace.photo && (
                      <img src={selectedPlace.photo} alt={selectedPlace.name} className="info-photo" />
                    )}
                    <h3>{selectedPlace.name}</h3>
                    <div className="info-rating">
                      {renderStars(selectedPlace.rating)}
                      <span>{selectedPlace.rating.toFixed(1)} ({selectedPlace.totalRatings})</span>
                    </div>
                    <p className="info-address">{selectedPlace.address}</p>
                    <div className="info-meta">
                      <span className="info-price">{getPriceLevel(selectedPlace.priceLevel)}</span>
                      {selectedPlace.isOpen !== null && (
                        <span className={`info-status ${selectedPlace.isOpen ? 'open' : 'closed'}`}>
                          {selectedPlace.isOpen ? '✓ Open now' : '✗ Closed'}
                        </span>
                      )}
                    </div>
                    <a
                      href={getDirectionsUrl(selectedPlace)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="directions-btn"
                    >
                      🗺️ Get Directions
                    </a>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className="map-loading">Loading map...</div>
          )}
        </div>

        <div className="places-list">
          <h2>
            {isLoading ? 'Searching...' : `${places.length} Places Nearby`}
          </h2>

          {isLoading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Finding great date spots near you...</p>
            </div>
          ) : (
            <div className="places-grid">
              {places.map((place) => (
                <div
                  key={place.id}
                  className={`place-card ${selectedPlace?.id === place.id ? 'selected' : ''}`}
                  onClick={() => handleMarkerClick(place)}
                >
                  <div className="place-image">
                    {place.photo ? (
                      <img src={place.photo} alt={place.name} />
                    ) : (
                      <div className="no-photo">
                        <span>{categories.find(c => c.id === filterCategory)?.icon || '📍'}</span>
                      </div>
                    )}
                    <span className="place-category">
                      {categories.find(c => c.id === filterCategory)?.icon}
                    </span>
                  </div>

                  <div className="place-info">
                    <h3>{place.name}</h3>
                    <div className="place-rating">
                      <div className="stars">{renderStars(place.rating)}</div>
                      <span className="rating-text">{place.rating.toFixed(1)}</span>
                      <span className="reviews-count">({place.totalRatings})</span>
                    </div>
                    <p className="place-address">📍 {place.address}</p>
                    <div className="place-meta">
                      <span className="place-price">{getPriceLevel(place.priceLevel)}</span>
                      {place.isOpen !== null && (
                        <span className={`place-status ${place.isOpen ? 'open' : 'closed'}`}>
                          {place.isOpen ? 'Open' : 'Closed'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="place-actions">
                    <a
                      href={getDirectionsUrl(place)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🗺️ Directions
                    </a>
                    <button className="action-btn-secondary">
                      ❤️ Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && places.length === 0 && (
            <div className="no-results">
              <span>😕</span>
              <h3>No places found</h3>
              <p>Try a different category or check your location settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
