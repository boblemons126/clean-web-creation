# MVP Context: Custom Weather Location Search

## Feature Overview
- **Name & Purpose**: Custom Weather Location Search. This feature allows users to manually search for and set a specific town for the weather widget, overriding the default device location.
- **User Impact**: Enables users to view weather for locations other than their current one, such as future travel destinations or the homes of family and friends.
- **Business Value**: Increases user engagement and personalization of the application.
- **Priority Level**: Medium
- **Estimated Complexity**: Medium

## Technical Specification
- **Architecture Overview**:
  - A new search input component will be added to `src/components/settings/widgets/WeatherSettings.tsx`.
  - This component will utilize the `searchLocationsEnhanced` function from `src/services/locationSearchService.ts` to fetch location suggestions as the user types.
  - The selected location's ID will be stored in the application's state using `LocationContext`.
  - The main weather widget (`src/components/weather/core/WeatherWidget.tsx`) will consume this selected location from the context to fetch and display weather data for the chosen town.
- **Core Logic**:
  1. The user navigates to the weather settings page.
  2. A new search input with a dropdown is available under the "Use Device Location" toggle.
  3. As the user types a location name, the application debounces the input and calls `searchLocationsEnhanced`.
  4. The service returns a list of matching locations, which are displayed in a dropdown menu.
  5. When the user selects a location, its ID is saved via the `setSelectedLocationId` function from `LocationContext`.
  6. Setting a custom location will automatically disable the "Use Device Location" toggle.
  7. The `useWeatherData` hook will detect the change in `selectedLocationId` from the context and trigger a new data fetch for the selected location.
  8. All weather-related components will automatically update with the new data.
- **Data Flow**:
  1. **User Input**: Search query is entered in `WeatherSettings.tsx`.
  2. **API Call**: `locationSearchService.ts` fetches location data.
  3. **Display Results**: `WeatherSettings.tsx` shows search results in a dropdown.
  4. **State Update**: User's selection calls `setSelectedLocationId` in `LocationContext.tsx`.
  5. **Data Fetching**: `useWeatherData.ts` hook reads the updated `selectedLocationId`.
  6. **Re-render**: Components like `WeatherWidget.tsx` display the new weather information.
- **Error Handling**:
  - If the location search API fails, display a user-friendly error message in the search component.
  - If no locations are found, show a "No results found" message in the dropdown.

## Dependencies & Integration
- **API Integration**: Leverages the existing location search service (`locationSearchService.ts`), requiring no new API keys or external dependencies.
- **File Dependencies**:
  - **Files to Modify**:
    - `src/components/settings/widgets/WeatherSettings.tsx`: To integrate the new location search UI.
    - `src/contexts/LocationContext.tsx`: To ensure it properly manages the state of `selectedLocationId` and its persistence.
    - `src/hooks/useWeatherData.ts`: To confirm it reacts to `selectedLocationId` changes.
  - **New Files**:
    - A reusable `LocationSearchInput.tsx` component will be created in `src/components/weather/location/` to encapsulate the search functionality.
- **Environment Variables**: None.

## Implementation Plan
- **Development Phases**:
  1.  **UI Component**: Build the `LocationSearchInput.tsx` component with a text input and a dropdown for results.
  2.  **Settings Integration**: Add the `LocationSearchInput` to `WeatherSettings.tsx` below the "Use Device Location" toggle.
  3.  **State Management**: Connect the component's selection logic to `LocationContext` to update the `selectedLocationId`. Implement the logic to disable the "Use Device Location" toggle when a custom location is active.
  4.  **Verification**: Ensure the `useWeatherData` hook and dependent components update correctly when the location changes.
- **Acceptance Criteria**:
  - A search bar appears in Weather Settings under the "Use Device Location" toggle.
  - Typing in the search bar populates a dropdown with location suggestions.
  - Selecting a location updates the main weather widget.
  - The selection persists across page reloads.
  - Enabling "Use Device Location" clears the custom location and reverts to the user's current location.

## Quality Assurance
- **Testing Strategy**:
  - **Unit**: Test `LocationSearchInput.tsx` in isolation, mocking the search service.
  - **Integration**: Verify that `WeatherSettings.tsx` correctly updates the `LocationContext`.
  - **E2E**: Simulate the full user flow from searching to seeing the weather widget update.
- **Performance**:
  - Debounce search input to limit API calls.
  - Ensure the UI remains responsive during search and data fetching.
- **Security**:
  - All user input should be handled safely by React.
  - No sensitive information should be exposed.