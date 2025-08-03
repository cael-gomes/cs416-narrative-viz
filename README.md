# The Education-Health Connection: A Narrative Visualization

An interactive story exploring how comprehensive sexual education and economic development together shape global health outcomes, built with D3.js.

## Project Overview

This narrative visualization tells the story of the relationship between economic development, education, and HIV/sexual health outcomes across the globe from 2006-2021. Using World Bank data, it demonstrates how education serves as a crucial bridge between economic development and better health outcomes.

## Structure

### Narrative Type: Interactive Slideshow
- **3 distinct scenes** with smooth transitions
- **User-controlled navigation** with Previous/Next buttons and scene indicators
- **Interactive filtering** allows exploration within each scene
- **Consistent visual template** maintains narrative flow

### The Three Scenes

#### Scene 1: "The Global Landscape"
- **Focus**: Relationship between income per capita and HIV incidence rates
- **Visualization**: Scatter plot with bubbles sized by population
- **Interaction**: Filter by year and region
- **Key Insight**: Higher income doesn't automatically mean lower HIV rates

#### Scene 2: "The Education Factor"
- **Focus**: How literacy and school enrollment correlate with health outcomes
- **Visualization**: Multi-dimensional scatter plot with education metrics
- **Interaction**: Toggle between literacy rate and school enrollment
- **Key Insight**: Education is a stronger predictor of health outcomes than income alone

#### Scene 3: "Behavioral Impact"
- **Focus**: Relationship between education and protective behavior (condom use)
- **Visualization**: Scatter plot showing education vs. behavioral outcomes
- **Interaction**: Filter by income level to see patterns
- **Key Insight**: Higher education correlates with safer sexual practices

## Technical Implementation

### Architecture
- **Frontend Only**: HTML, CSS, JavaScript (no backend required)
- **D3.js v7**: Latest version for modern data visualization
- **d3-annotation**: Professional annotation system
- **Responsive Design**: Works on desktop and mobile devices

### Data Processing
- **Source**: World Bank World Development Indicators
- **Timeframe**: 2006-2021 (15 years)
- **Coverage**: 217 countries across 7 regions
- **Key Indicators**: Income, education, HIV rates, behavioral data

### Visual Structure
- **Consistent Template**: Each scene follows the same layout pattern
- **Modern Color Scheme**: Income levels, regions, and trends clearly differentiated
- **Interactive Elements**: Hover tooltips, filtering controls, smooth transitions
- **Annotations**: Strategic highlighting of key insights and patterns

### Parameters (State Variables)
- `currentScene`: Tracks which of the 3 scenes is active
- `selectedYear`: Year filter for temporal analysis
- `selectedRegion`: Geographic filter for regional focus
- `hoveredCountry`: For interactive tooltip display
- `filterSettings`: Various filters for data exploration

### Triggers (User Interactions)
- **Navigation**: Previous/Next buttons and scene dot indicators
- **Filtering**: Dropdown controls for year, region, income level
- **Exploration**: Hover tooltips for detailed country information
- **Transitions**: Smooth animations between scenes and data updates

## Key Features

### Journalistic Approach
- **Accessible Language**: No jargon, clear storytelling
- **Data-Driven**: Every claim backed by visualized evidence
- **Progressive Disclosure**: Complexity builds across scenes
- **Call to Action**: Ends with potential for improvement

### Modern Design
- **CSS Variables**: Consistent theming throughout
- **Inter Font**: Modern, readable typography
- **Subtle Animations**: Enhance without distracting
- **Mobile Responsive**: Adapts to different screen sizes

### Educational Value
- **Global Perspective**: Shows patterns across different regions and income levels
- **Temporal Analysis**: 15 years of data reveal trends over time
- **Policy Implications**: Highlights successful interventions
- **Actionable Insights**: Clear takeaways for public health policy

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers on iOS and Android

## File Structure

```
Narrative_Visualization_Project/
├── index.html              # Main visualization page
├── narrative-viz.js         # D3.js visualization engine
├── data/
│   ├── processed_data.json  # Cleaned dataset (2006-2021)
│   └── data_summary.json    # Dataset metadata
└── README.md               # This file
```

## Usage

1. Open `index.html` in a modern web browser
2. Navigate through the 3 scenes using the controls
3. Interact with filters to explore different perspectives
4. Hover over data points for detailed information
5. Use the story to understand global health patterns

## Data Sources

- **World Bank World Development Indicators**: Primary dataset
- **Timeframe**: 2006-2021
- **Last Updated**: 2023
- **Coverage**: Global with regional breakdowns

## Insights and Findings

The visualization reveals several key insights:

1. **Income alone is insufficient**: High-income countries can still have significant HIV challenges
2. **Education as a bridge**: Literacy and school enrollment are stronger predictors of health outcomes
3. **Behavioral change**: Education translates directly to protective behaviors
4. **Policy success stories**: Countries that invested in education saw health improvements
5. **Remaining challenges**: Gaps still exist that targeted interventions could address

---

Built with ❤️ using D3.js and modern web technologies.