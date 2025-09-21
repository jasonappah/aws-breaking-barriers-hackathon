# Crisis Trigger Functionality

## Overview

The crisis trigger functionality has been implemented to connect the "Trigger Crisis" button in the **infra interface** with the existing JSON data and Bedrock AI integration. When triggered, it:

1. Loads event reports from the existing JSON data in `web/apps/server/src/db/data/event-reports.json`
2. Processes the data through AWS Bedrock using Claude 3.5 Sonnet
3. Generates a comprehensive crisis analysis including:
   - Risk polygons based on event severity and location
   - Heat points for visualization
   - AI-generated crisis brief
   - Risk summary statistics

## How It Works

### Backend Implementation

**New Router: `impact-trigger.ts`**
- `triggerCrisis`: Main endpoint that processes event data through Bedrock
- `getEventReports`: Retrieves existing event reports from JSON
- `getRiskData`: Retrieves existing risk data from GeoJSON

**Integration with Existing Bedrock Code**
- Uses the existing `computeImpact` function in `lib/impact.ts`
- Leverages AWS Location Service for geocoding
- Uses Claude 3.5 Sonnet for AI analysis

### Frontend Implementation

**Updated Infra Route (`infra.tsx`)**
- Added crisis trigger button in the Layers panel
- Integrated with ORPC for API calls
- Displays AI-generated crisis brief and analysis in Inspector panel
- Shows real-time processing status

**Updated Map Component (`DeckGlMapCanvas.tsx`)**
- Accepts crisis data from Bedrock analysis
- Uses real risk polygons from AI analysis
- Adds heat points layer for crisis visualization
- Falls back to default risk data if no crisis data available

## API Endpoints

### POST `/rpc/impactTrigger.triggerCrisis`
Triggers crisis analysis using existing JSON data.

**Request:**
```json
{
  "useExistingData": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Crisis triggered successfully",
  "data": {
    "generated_at": "2024-01-15T14:30:00Z",
    "summary": {
      "events": 3,
      "max_severity": "Critical"
    },
    "risk": {
      "type": "FeatureCollection",
      "features": [...]
    },
    "heat": {
      "type": "FeatureCollection", 
      "features": [...]
    },
    "brief": "AI-generated crisis analysis..."
  }
}
```

## Environment Variables

The following environment variables are used by the Bedrock integration:

- `AWS_REGION`: AWS region (default: "us-west-2")
- `PLACE_INDEX_NAME`: AWS Location Service place index (default: "CrisisPlaceIndex")

## Usage

1. Navigate to the `/infra` route
2. In the Layers panel, click the "Trigger Crisis" button
3. The system will:
   - Load existing event reports from JSON
   - Process through Bedrock AI
   - Generate risk polygons and heat points
   - Display AI-generated crisis brief in Inspector panel
   - Update the map with real risk areas and heat points

## Features

- **Real-time Processing**: Shows loading state during Bedrock analysis
- **AI-Generated Analysis**: Uses Claude 3.5 Sonnet for crisis brief
- **Dynamic Risk Areas**: Map updates with actual risk polygons from analysis
- **Comprehensive Data**: Displays event count, severity, and generated timestamp
- **Error Handling**: Graceful fallback and user feedback

## Data Flow

1. User clicks "Trigger Crisis"
2. Frontend calls `impactTrigger.triggerCrisis`
3. Backend loads `event-reports.json`
4. Data processed through `computeImpact` function
5. Bedrock AI generates analysis and brief
6. Risk polygons and heat points created
7. Frontend receives complete analysis
8. Map updates with real risk areas
9. Crisis brief displayed in right panel

This implementation provides a complete end-to-end crisis simulation using real data and AI analysis.
