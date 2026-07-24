const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const pool = require('./db');

const CATEGORIES = [
  'satellite-image-analysis',
  'land-use-classification',
  'change-detection',
  'crop-health-monitoring',
  'urban-planning',
  'climate-impact',
  'defense-security',
  'water-body-analysis',
  'vegetation-index',
  'disaster-assessment',
  'infrastructure-detection',
  'air-quality',
  'terrain-analysis',
  'population-density',
  'mining-resource-detection',
];

const STATUSES = ['pending', 'completed', 'in-progress', 'failed', 'completed', 'completed', 'pending', 'completed', 'in-progress', 'completed', 'completed', 'pending', 'completed', 'completed', 'completed'];
const PRIORITIES = ['low', 'medium', 'high', 'critical', 'medium', 'high', 'low', 'medium', 'high', 'critical', 'medium', 'low', 'high', 'medium', 'critical'];

const SEED_DATA = {
  'satellite-image-analysis': {
    items: [
      { title: 'Sahara Desert Thermal Mapping', location: 'Sahara Desert, Algeria', coordinates: '27.1256, 2.6323', description: 'High-resolution thermal analysis of the Sahara Desert to track temperature variations and sand dune migration patterns.' },
      { title: 'Amazon Basin Cloud-Free Composite', location: 'Amazon Basin, Brazil', coordinates: '-3.4653, -62.2159', description: 'Multi-temporal composite imagery of the Amazon Basin using cloud-masking algorithms for deforestation monitoring.' },
      { title: 'Himalayan Glacier Survey', location: 'Karakoram Range, Pakistan', coordinates: '36.3167, 76.0167', description: 'High-altitude glacier extent survey using SAR and optical fusion imagery.' },
      { title: 'Tokyo Metropolitan Nighttime Analysis', location: 'Tokyo, Japan', coordinates: '35.6762, 139.6503', description: 'VIIRS nighttime light analysis of Tokyo metropolitan area for energy consumption patterns.' },
      { title: 'Great Barrier Reef Shallow Water Mapping', location: 'Queensland, Australia', coordinates: '-18.2871, 147.6992', description: 'Multispectral bathymetric analysis of shallow reef structures and coral coverage.' },
      { title: 'Arctic Sea Ice Extent August', location: 'Arctic Ocean', coordinates: '82.5000, -40.0000', description: 'Monthly sea ice extent measurement using passive microwave satellite data.' },
      { title: 'Nile Delta Agricultural Survey', location: 'Nile Delta, Egypt', coordinates: '31.0433, 31.3528', description: 'Multi-band analysis of agricultural activity in the Nile Delta region.' },
      { title: 'Los Angeles Urban Heat Island', location: 'Los Angeles, USA', coordinates: '34.0522, -118.2437', description: 'Landsat thermal band analysis revealing urban heat island effects across the LA basin.' },
      { title: 'Borneo Peat Forest Monitoring', location: 'Kalimantan, Indonesia', coordinates: '-1.6814, 116.4194', description: 'Radar-based monitoring of tropical peat forests for subsidence and fire risk.' },
      { title: 'Iceland Volcanic Activity Survey', location: 'Reykjanes Peninsula, Iceland', coordinates: '63.8600, -22.4400', description: 'InSAR deformation analysis near active volcanic zones.' },
      { title: 'Mediterranean Sea Surface Temperature', location: 'Mediterranean Sea', coordinates: '35.0000, 18.0000', description: 'MODIS-derived SST mapping for marine ecosystem assessment.' },
      { title: 'Siberian Permafrost Thaw Detection', location: 'Yakutia, Russia', coordinates: '62.0355, 129.6755', description: 'Sentinel-1 SAR analysis detecting thermokarst lake formation from permafrost thaw.' },
      { title: 'Panama Canal Zone Survey', location: 'Panama Canal, Panama', coordinates: '9.0800, -79.6800', description: 'High-resolution optical survey of canal operations and vessel traffic.' },
      { title: 'Atacama Desert Lithium Deposits', location: 'Atacama, Chile', coordinates: '-23.8634, -69.1328', description: 'Hyperspectral mineral detection survey over lithium brine deposits.' },
      { title: 'Dubai Coastal Development Tracking', location: 'Dubai, UAE', coordinates: '25.2048, 55.2708', description: 'Time-series analysis of artificial island and coastal infrastructure expansion.' },
    ],
    aiResult: (i) => ({
      summary: 'Satellite imagery analysis reveals significant spatial patterns and features across the target area. Image quality is suitable for detailed interpretation with minimal atmospheric interference.',
      findings: [
        'Image resolution meets threshold for feature-level identification at 10m spatial resolution',
        'Cloud coverage is below 15% allowing reliable ground feature extraction',
        'Spectral signatures indicate diverse land cover types within the study area',
        'Temporal consistency confirmed across multi-date acquisitions',
        'Radiometric calibration validated against ground control points',
      ],
      recommendations: [
        'Acquire additional imagery during optimal sun angle for shadow reduction',
        'Apply atmospheric correction using local aerosol measurements',
        'Integrate with ground-truth data for classification accuracy assessment',
      ],
      riskLevel: ['low', 'medium', 'low', 'medium', 'high'][i % 5],
      confidence: 0.78 + (i % 20) / 100,
      metrics: { resolution: '10m', cloudCoverage: `${5 + i * 2}%`, spectralBands: '13', areaKm2: `${500 + i * 100}`, imageQuality: 'high' },
    }),
  },
  'land-use-classification': {
    items: [
      { title: 'São Paulo Metropolitan Land Use', location: 'São Paulo, Brazil', coordinates: '-23.5505, -46.6333', description: 'Supervised classification of land use types across the greater São Paulo metropolitan region.' },
      { title: 'Netherlands Polders Classification', location: 'North Holland, Netherlands', coordinates: '52.3676, 4.9041', description: 'Land use mapping of reclaimed polder regions showing agricultural and urban zones.' },
      { title: 'Mumbai Informal Settlement Mapping', location: 'Mumbai, India', coordinates: '19.0760, 72.8777', description: 'Object-based classification identifying formal and informal settlement boundaries.' },
      { title: 'Central Valley Agricultural Parcels', location: 'Central Valley, California', coordinates: '36.7783, -119.4179', description: 'Crop type classification using time-series NDVI profiles for individual agricultural parcels.' },
      { title: 'Berlin Green Infrastructure Map', location: 'Berlin, Germany', coordinates: '52.5200, 13.4050', description: 'Detailed classification of urban green spaces including parks, gardens, and street trees.' },
      { title: 'Lagos Rapid Urbanization Study', location: 'Lagos, Nigeria', coordinates: '6.5244, 3.3792', description: 'Multi-temporal land use classification tracking rapid urban expansion over 10 years.' },
      { title: 'Mekong Delta Land Use Change', location: 'Mekong Delta, Vietnam', coordinates: '10.0341, 105.7226', description: 'Classification of rice paddies, aquaculture ponds, and mangrove forests.' },
      { title: 'Scottish Highlands Land Cover', location: 'Scottish Highlands, UK', coordinates: '57.1497, -4.7142', description: 'Semi-automated classification of moorland, forest, and agricultural land in Highland region.' },
      { title: 'Nairobi Peri-Urban Classification', location: 'Nairobi, Kenya', coordinates: '-1.2921, 36.8219', description: 'Classification of the urban-rural transition zone around Nairobi.' },
      { title: 'Rhine-Ruhr Industrial Zones', location: 'Rhine-Ruhr, Germany', coordinates: '51.4556, 7.0116', description: 'Classification of industrial, commercial, and brownfield sites in the Rhine-Ruhr metropolitan area.' },
      { title: 'Bangkok Flood-Prone Zone Mapping', location: 'Bangkok, Thailand', coordinates: '13.7563, 100.5018', description: 'Land use classification for flood vulnerability assessment in low-lying areas.' },
      { title: 'Tuscany Vineyard Detection', location: 'Tuscany, Italy', coordinates: '43.7711, 11.2486', description: 'Deep learning-based vineyard parcel detection and classification from Sentinel-2 data.' },
      { title: 'Phoenix Suburban Sprawl Analysis', location: 'Phoenix, Arizona', coordinates: '33.4484, -112.0740', description: 'Classification of suburban development patterns and desert land conversion.' },
      { title: 'Ganges Floodplain Land Use', location: 'Ganges Plain, India', coordinates: '25.3176, 82.9739', description: 'Seasonal land use classification along the Ganges floodplain.' },
      { title: 'Singapore Land Reclamation Map', location: 'Singapore', coordinates: '1.3521, 103.8198', description: 'Historical land use classification showing 50 years of land reclamation.' },
    ],
    aiResult: (i) => ({
      summary: 'Land use classification identifies distinct zones with high separability between classes. Urban expansion trends are evident with conversion of agricultural and natural areas.',
      findings: [
        'Residential areas account for the largest single land use class at approximately 35%',
        'Agricultural land shows seasonal variation requiring multi-temporal classification',
        'Commercial/industrial zones are concentrated along major transportation corridors',
        'Forest and natural vegetation cover is declining at an estimated 2.1% annually',
        'Water bodies and wetlands show stable extent with minor seasonal fluctuation',
      ],
      recommendations: [
        'Implement zoning enforcement to protect remaining agricultural land',
        'Establish green buffer zones between industrial and residential areas',
        'Monitor illegal land conversion using quarterly satellite revisits',
      ],
      riskLevel: ['medium', 'high', 'medium', 'low', 'high'][i % 5],
      confidence: 0.82 + (i % 15) / 100,
      metrics: { residentialPct: `${30 + i}`, commercialPct: `${10 + i % 5}`, agriculturalPct: `${25 - i % 10}`, forestPct: `${15 + i % 8}`, waterPct: `${5 + i % 3}`, barrenPct: `${3 + i % 4}` },
    }),
  },
  'change-detection': {
    items: [
      { title: 'Beijing Urban Expansion 2015-2025', location: 'Beijing, China', coordinates: '39.9042, 116.4074', description: 'Decade-long change detection study tracking the expansion of Beijing metropolitan area.' },
      { title: 'Australian Bushfire Recovery', location: 'New South Wales, Australia', coordinates: '-33.0000, 150.0000', description: 'Post-fire vegetation recovery analysis using bi-temporal Sentinel-2 imagery.' },
      { title: 'Dead Sea Shoreline Retreat', location: 'Dead Sea, Jordan', coordinates: '31.5000, 35.5000', description: 'Annual shoreline change detection revealing rapid water level decline.' },
      { title: 'Rotterdam Port Expansion', location: 'Rotterdam, Netherlands', coordinates: '51.9244, 4.4777', description: 'Construction monitoring of Maasvlakte 2 port expansion using SAR change detection.' },
      { title: 'Congo Rainforest Deforestation', location: 'Democratic Republic of Congo', coordinates: '-0.2280, 25.0000', description: 'Annual deforestation mapping in the Congo Basin using Landsat change detection.' },
      { title: 'Venice Subsidence Monitoring', location: 'Venice, Italy', coordinates: '45.4408, 12.3155', description: 'InSAR-based subsidence monitoring of Venice and surrounding lagoon area.' },
      { title: 'Aral Sea Desiccation Tracking', location: 'Aral Sea, Kazakhstan', coordinates: '45.0000, 59.0000', description: 'Multi-decadal change detection of the Aral Sea shrinkage and environmental impact.' },
      { title: 'Shenzhen Mega-City Growth', location: 'Shenzhen, China', coordinates: '22.5431, 114.0579', description: 'Urbanization change detection showing Shenzhen transformation from fishing village to megacity.' },
      { title: 'Greenland Ice Sheet Mass Loss', location: 'Greenland', coordinates: '71.7069, -42.6043', description: 'GRACE and optical fusion for ice sheet mass balance change detection.' },
      { title: 'Lagos Lagoon Land Reclamation', location: 'Lagos, Nigeria', coordinates: '6.4531, 3.4200', description: 'Monitoring Eko Atlantic City land reclamation progress from satellite imagery.' },
      { title: 'California Wildfire Burn Scar', location: 'Northern California, USA', coordinates: '39.7600, -121.6100', description: 'Pre and post-fire change detection for burn severity mapping.' },
      { title: 'Istanbul Third Bridge Impact', location: 'Istanbul, Turkey', coordinates: '41.2035, 29.0850', description: 'Land use change detection around the Yavuz Sultan Selim Bridge construction corridor.' },
      { title: 'Jakarta Coastal Erosion', location: 'Jakarta, Indonesia', coordinates: '-6.2088, 106.8456', description: 'Shoreline change detection revealing coastal erosion and subsidence impacts.' },
      { title: 'Chile Copper Mine Expansion', location: 'Atacama Region, Chile', coordinates: '-27.3668, -70.3323', description: 'Open-pit mine expansion monitoring using multi-temporal satellite imagery.' },
      { title: 'Florida Everglades Water Level', location: 'Everglades, Florida', coordinates: '25.7500, -80.9000', description: 'Seasonal water extent change detection in the Everglades restoration area.' },
    ],
    aiResult: (i) => ({
      summary: 'Change detection analysis reveals significant landscape modifications over the study period. Both natural and anthropogenic drivers are identified with quantified change metrics.',
      findings: [
        'Total changed area exceeds initial estimates by approximately 18%',
        'Urban expansion is the primary driver of land cover change in the study area',
        'Vegetation loss detected in peripheral zones correlates with development permits',
        'Water body boundaries show measurable shifts linked to climate variability',
        'Infrastructure development has created new impervious surfaces affecting drainage',
      ],
      recommendations: [
        'Increase monitoring frequency to quarterly intervals for rapidly changing areas',
        'Establish change alert thresholds for automated notification systems',
        'Correlate detected changes with policy interventions for effectiveness assessment',
      ],
      riskLevel: ['medium', 'high', 'critical', 'low', 'high'][i % 5],
      confidence: 0.80 + (i % 18) / 100,
      metrics: { changeAreaKm2: `${10 + i * 5}`, changePct: `${3 + i * 0.8}`, timeSpanDays: `${365 * (1 + i % 3)}`, majorChangeType: ['urbanization', 'deforestation', 'flooding', 'erosion', 'development'][i % 5], confidenceScore: `${0.82 + i * 0.01}` },
    }),
  },
  'crop-health-monitoring': {
    items: [
      { title: 'Iowa Corn Belt NDVI Analysis', location: 'Iowa, USA', coordinates: '41.8780, -93.0977', description: 'Mid-season crop vigor assessment for corn using Sentinel-2 NDVI time series.' },
      { title: 'Punjab Wheat Stress Detection', location: 'Punjab, India', coordinates: '31.1471, 75.3412', description: 'Water stress and nutrient deficiency detection in winter wheat crops.' },
      { title: 'Bordeaux Vineyard Health Survey', location: 'Bordeaux, France', coordinates: '44.8378, -0.5792', description: 'Precision viticulture health monitoring using high-resolution multispectral drone and satellite fusion.' },
      { title: 'Argentine Soybean Monitoring', location: 'Pampas, Argentina', coordinates: '-34.6037, -58.3816', description: 'Large-scale soybean health monitoring across the Argentine Pampas during critical growth stages.' },
      { title: 'Ethiopian Coffee Plantation Survey', location: 'Jimma, Ethiopia', coordinates: '7.6733, 36.8340', description: 'Shade-grown coffee plantation health assessment using red-edge spectral indices.' },
      { title: 'Thai Rice Paddy Disease Detection', location: 'Chiang Mai, Thailand', coordinates: '18.7883, 98.9853', description: 'Bacterial leaf blight early detection in rice paddies using SAR and optical fusion.' },
      { title: 'Brazilian Sugarcane Yield Forecast', location: 'São Paulo State, Brazil', coordinates: '-21.5800, -48.0500', description: 'Pre-harvest sugarcane biomass estimation using multi-temporal satellite data.' },
      { title: 'Ukrainian Sunflower Field Monitoring', location: 'Odessa Oblast, Ukraine', coordinates: '46.4825, 30.7233', description: 'Sunflower crop health and drought stress monitoring during summer growing season.' },
      { title: 'Napa Valley Grape Maturity Tracking', location: 'Napa Valley, USA', coordinates: '38.5025, -122.2654', description: 'Precision monitoring of grape maturity using thermal and NDVI satellite indices.' },
      { title: 'Indonesian Palm Oil Monitoring', location: 'Sumatra, Indonesia', coordinates: '0.5897, 101.3431', description: 'Oil palm plantation health assessment and replanting priority mapping.' },
      { title: 'Spanish Olive Grove Analysis', location: 'Andalusia, Spain', coordinates: '37.3891, -5.9845', description: 'Olive tree canopy health monitoring using WorldView-3 satellite imagery.' },
      { title: 'Australian Cotton Irrigation Monitor', location: 'New South Wales, Australia', coordinates: '-30.0000, 149.0000', description: 'Cotton field irrigation efficiency analysis using thermal and NDVI data.' },
      { title: 'Kenyan Tea Plantation Survey', location: 'Kericho, Kenya', coordinates: '-0.3670, 35.2836', description: 'Tea plantation health assessment and yield prediction model validation.' },
      { title: 'Chinese Rice Terraces Monitoring', location: 'Yunnan, China', coordinates: '23.1000, 103.1000', description: 'Terraced rice paddy health monitoring in mountainous terrain.' },
      { title: 'Mexican Avocado Belt Analysis', location: 'Michoacán, Mexico', coordinates: '19.1800, -101.8900', description: 'Avocado orchard health and expansion monitoring in the Michoacán growing region.' },
    ],
    aiResult: (i) => ({
      summary: 'Crop health analysis indicates variable conditions across the surveyed agricultural area. NDVI values suggest overall moderate health with localized stress zones requiring targeted intervention.',
      findings: [
        'Average NDVI of 0.72 indicates generally healthy vegetation vigor',
        'Water stress signatures detected in approximately 15% of the surveyed parcels',
        'Chlorophyll content variations suggest uneven fertilizer application',
        'Early-stage pest or disease indicators found in southeastern field sectors',
        'Crop growth stage is consistent with expected phenological calendar',
      ],
      recommendations: [
        'Apply targeted irrigation to water-stressed zones identified in the western parcels',
        'Conduct ground-based scouting in areas showing anomalous spectral signatures',
        'Adjust fertilizer application rates based on chlorophyll mapping results',
      ],
      riskLevel: ['low', 'medium', 'high', 'medium', 'low'][i % 5],
      confidence: 0.83 + (i % 14) / 100,
      metrics: { ndviAvg: `${0.65 + i * 0.02}`, ndviMin: `${0.35 + i * 0.01}`, ndviMax: `${0.88 + i * 0.005}`, waterStressIndex: `${0.2 + i * 0.03}`, chlorophyllLevel: `${35 + i * 2}`, healthyAreaPct: `${70 + i}` },
    }),
  },
  'urban-planning': {
    items: [
      { title: 'Singapore Smart City Analysis', location: 'Singapore', coordinates: '1.3521, 103.8198', description: 'Comprehensive urban morphology analysis for smart city planning initiatives.' },
      { title: 'Copenhagen Green Space Assessment', location: 'Copenhagen, Denmark', coordinates: '55.6761, 12.5683', description: 'Green space accessibility and distribution analysis for urban livability metrics.' },
      { title: 'Cairo Informal Settlement Growth', location: 'Cairo, Egypt', coordinates: '30.0444, 31.2357', description: 'Tracking informal settlement expansion and infrastructure gap analysis.' },
      { title: 'Austin Texas Sprawl Analysis', location: 'Austin, Texas', coordinates: '30.2672, -97.7431', description: 'Suburban sprawl quantification and transit-oriented development feasibility.' },
      { title: 'Barcelona Superblock Planning', location: 'Barcelona, Spain', coordinates: '41.3874, 2.1686', description: 'Analysis supporting superblock urban redesign for pedestrian-friendly neighborhoods.' },
      { title: 'Nairobi Transit Corridor Study', location: 'Nairobi, Kenya', coordinates: '-1.2864, 36.8172', description: 'Transit-oriented development analysis along proposed BRT corridors.' },
      { title: 'Melbourne Urban Density Mapping', location: 'Melbourne, Australia', coordinates: '-37.8136, 144.9631', description: 'Floor area ratio and building height estimation from satellite stereo imagery.' },
      { title: 'Riyadh New City Development', location: 'Riyadh, Saudi Arabia', coordinates: '24.7136, 46.6753', description: 'NEOM and related new city development progress tracking from satellite.' },
      { title: 'Portland Oregon Zoning Compliance', location: 'Portland, Oregon', coordinates: '45.5051, -122.6750', description: 'Satellite-based verification of zoning compliance and land use changes.' },
      { title: 'Ho Chi Minh City Flood Risk', location: 'Ho Chi Minh City, Vietnam', coordinates: '10.8231, 106.6297', description: 'Urban planning analysis integrating flood risk assessment and development pressure.' },
      { title: 'Stockholm Car-Free Zone Analysis', location: 'Stockholm, Sweden', coordinates: '59.3293, 18.0686', description: 'Impact analysis of car-free urban zones on surrounding traffic and land use.' },
      { title: 'Lagos Master Plan Assessment', location: 'Lagos, Nigeria', coordinates: '6.5244, 3.3792', description: 'Satellite-based assessment of Lagos 2050 master plan implementation progress.' },
      { title: 'Denver TOD Feasibility Study', location: 'Denver, Colorado', coordinates: '39.7392, -104.9903', description: 'Transit-oriented development feasibility analysis along light rail corridors.' },
      { title: 'Kuala Lumpur Green Building Index', location: 'Kuala Lumpur, Malaysia', coordinates: '3.1390, 101.6869', description: 'Rooftop and facade analysis for green building certification support.' },
      { title: 'Amsterdam Cycling Infrastructure Map', location: 'Amsterdam, Netherlands', coordinates: '52.3676, 4.9041', description: 'Cycling infrastructure detection and gap analysis from high-resolution imagery.' },
    ],
    aiResult: (i) => ({
      summary: 'Urban planning analysis reveals a dynamic metropolitan area with significant development potential and challenges. Built-up density and green space distribution require strategic rebalancing.',
      findings: [
        'Built-up area has increased by 12% over the past 5 years',
        'Green space per capita falls below WHO recommended minimum of 9 sq meters',
        'Road network density is adequate for current traffic but insufficient for projected growth',
        'Mixed-use development zones show highest walkability scores',
        'Informal development accounts for approximately 8% of new construction',
      ],
      recommendations: [
        'Prioritize infill development over greenfield expansion to preserve agricultural land',
        'Increase green space allocation in new development zones by minimum 15%',
        'Implement satellite-based monitoring for unauthorized construction detection',
      ],
      riskLevel: ['medium', 'high', 'medium', 'low', 'high'][i % 5],
      confidence: 0.79 + (i % 18) / 100,
      metrics: { builtUpAreaPct: `${55 + i * 2}`, greenSpacePct: `${15 - i % 5}`, roadDensity: `${12.5 + i * 0.5}`, populationEstimate: `${500000 + i * 100000}`, growthRate: `${1.5 + i * 0.3}` },
    }),
  },
  'climate-impact': {
    items: [
      { title: 'Antarctic Ice Shelf Calving Event', location: 'Larsen Ice Shelf, Antarctica', coordinates: '-67.5000, -62.0000', description: 'Post-calving analysis of ice shelf fragmentation and tabular iceberg tracking.' },
      { title: 'Tuvalu Sea Level Rise Assessment', location: 'Tuvalu, Pacific Ocean', coordinates: '-8.5167, 179.2167', description: 'Coastal inundation modeling using satellite-derived sea level and topographic data.' },
      { title: 'Sahel Desertification Monitoring', location: 'Sahel Region, Africa', coordinates: '14.4974, 0.0000', description: 'Long-term vegetation trend analysis to assess desertification progress in the Sahel.' },
      { title: 'Great Lakes Temperature Anomaly', location: 'Great Lakes, USA', coordinates: '44.0000, -84.0000', description: 'Lake surface temperature anomaly detection and ice cover duration analysis.' },
      { title: 'Himalayan Snowline Retreat', location: 'Nepal Himalayas', coordinates: '28.0000, 85.0000', description: 'Annual snowline elevation tracking in the central Himalayas.' },
      { title: 'Amazon Drought Impact Analysis', location: 'Amazon Basin, Brazil', coordinates: '-5.0000, -60.0000', description: 'Vegetation stress and river level analysis during exceptional drought events.' },
      { title: 'European Heatwave Urban Impact', location: 'Western Europe', coordinates: '48.8566, 2.3522', description: 'Urban heat island intensification analysis during extreme heatwave events.' },
      { title: 'Coral Bleaching Pacific Assessment', location: 'Pacific Ocean', coordinates: '-17.7134, 178.0650', description: 'Satellite-detected coral bleaching extent mapping across the Pacific.' },
      { title: 'Siberian Wildfire Carbon Release', location: 'Siberia, Russia', coordinates: '60.0000, 100.0000', description: 'Burn area estimation and carbon release calculation from boreal wildfires.' },
      { title: 'Ganges Glacier Meltwater Tracking', location: 'Gangotri Glacier, India', coordinates: '30.9300, 79.0800', description: 'Glacier retreat and meltwater contribution analysis for Ganges headwaters.' },
      { title: 'California Megadrought Assessment', location: 'California, USA', coordinates: '37.0000, -120.0000', description: 'Multi-year drought impact on reservoirs, snowpack, and vegetation health.' },
      { title: 'Maldives Coastal Erosion Study', location: 'Maldives', coordinates: '3.2028, 73.2207', description: 'Atoll erosion rates and beach sediment transport under rising sea conditions.' },
      { title: 'Alps Permafrost Degradation', location: 'Swiss Alps', coordinates: '46.5000, 8.0000', description: 'Rock glacier movement and permafrost degradation analysis from InSAR data.' },
      { title: 'Lake Chad Shrinkage Analysis', location: 'Lake Chad, Africa', coordinates: '13.0000, 14.0000', description: 'Multi-decadal water extent analysis of Lake Chad from Landsat archive.' },
      { title: 'Bangladesh Cyclone Vulnerability', location: 'Coastal Bangladesh', coordinates: '22.0000, 90.0000', description: 'Coastal vulnerability mapping for cyclone impact and sea level rise adaptation.' },
    ],
    aiResult: (i) => ({
      summary: 'Climate impact assessment reveals measurable environmental changes consistent with global warming trends. The study area shows both gradual shifts and episodic extreme events requiring adaptation measures.',
      findings: [
        'Temperature anomaly of +1.8°C above 30-year average detected in the region',
        'Ice/snow coverage has decreased by approximately 12% over the monitoring period',
        'Sea level indicators show a rising trend of 3.2mm per year locally',
        'Carbon absorption capacity has declined due to vegetation stress and loss',
        'Extreme weather event frequency has increased by 40% in the last decade',
      ],
      recommendations: [
        'Implement early warning systems using satellite-based monitoring for extreme events',
        'Develop climate adaptation strategies for vulnerable coastal communities',
        'Establish carbon sink restoration programs in degraded ecosystems',
      ],
      riskLevel: ['high', 'critical', 'high', 'medium', 'critical'][i % 5],
      confidence: 0.81 + (i % 16) / 100,
      metrics: { temperatureAnomaly: `${1.2 + i * 0.15}`, iceCoveragePct: `${60 - i * 3}`, seaLevelChange: `${2.5 + i * 0.3}mm/yr`, carbonIndex: `${0.6 - i * 0.02}`, albedoChange: `${-0.02 - i * 0.003}` },
    }),
  },
  'defense-security': {
    items: [
      { title: 'Strait of Hormuz Vessel Tracking', location: 'Strait of Hormuz', coordinates: '26.5667, 56.2500', description: 'Maritime domain awareness analysis tracking vessel traffic patterns and anomalies.' },
      { title: 'Korean DMZ Activity Monitoring', location: 'Korean DMZ', coordinates: '38.0000, 127.0000', description: 'Periodic activity monitoring along the demilitarized zone using commercial satellite imagery.' },
      { title: 'South China Sea Island Building', location: 'South China Sea', coordinates: '11.0000, 114.0000', description: 'Artificial island construction progress and militarization assessment.' },
      { title: 'Kaliningrad Military Base Survey', location: 'Kaliningrad, Russia', coordinates: '54.7104, 20.4522', description: 'Open-source intelligence assessment of military facility changes.' },
      { title: 'Red Sea Shipping Lane Security', location: 'Red Sea', coordinates: '15.0000, 42.0000', description: 'Maritime security assessment of Red Sea commercial shipping lanes.' },
      { title: 'Arctic Military Buildup Analysis', location: 'Arctic Region', coordinates: '75.0000, 40.0000', description: 'Satellite-based assessment of military infrastructure development in the Arctic.' },
      { title: 'Taiwan Strait Activity Monitor', location: 'Taiwan Strait', coordinates: '24.5000, 119.0000', description: 'Naval activity pattern analysis in the Taiwan Strait region.' },
      { title: 'Libya Conflict Zone Assessment', location: 'Tripoli, Libya', coordinates: '32.9094, 13.1894', description: 'Conflict damage assessment and population displacement estimation.' },
      { title: 'Persian Gulf Port Security', location: 'Persian Gulf', coordinates: '27.0000, 51.0000', description: 'Critical port infrastructure security assessment and vessel identification.' },
      { title: 'Black Sea Naval Activity', location: 'Black Sea', coordinates: '43.0000, 34.0000', description: 'Naval fleet positioning and activity pattern analysis.' },
      { title: 'East Africa Piracy Zone Monitor', location: 'Gulf of Aden', coordinates: '12.0000, 47.0000', description: 'Maritime piracy risk zone monitoring and vessel tracking.' },
      { title: 'Central Asia Base Activity', location: 'Central Asia', coordinates: '39.0000, 66.0000', description: 'Military base activity level monitoring using change detection.' },
      { title: 'Mediterranean Migrant Route', location: 'Central Mediterranean', coordinates: '35.0000, 15.0000', description: 'Maritime surveillance supporting search and rescue operations.' },
      { title: 'Indo-Pacific Submarine Cable Map', location: 'Indo-Pacific Region', coordinates: '5.0000, 120.0000', description: 'Critical undersea cable infrastructure mapping and vulnerability assessment.' },
      { title: 'Northern Border Surveillance', location: 'Northern Border Region', coordinates: '49.0000, -100.0000', description: 'Remote border area surveillance and activity detection.' },
    ],
    aiResult: (i) => ({
      summary: 'Security analysis of the target area indicates notable activity patterns requiring continued monitoring. Facility and infrastructure assessments provide baseline for future change detection.',
      findings: [
        'Identified key facilities and infrastructure elements within the area of interest',
        'Activity levels are assessed as moderate with periodic increases during specific timeframes',
        'Perimeter and access control infrastructure appears maintained and operational',
        'Vehicle and vessel movement patterns are consistent with routine operations',
        'No significant deviations from established baseline patterns detected',
      ],
      recommendations: [
        'Maintain regular revisit schedule for baseline comparison',
        'Establish automated change detection alerts for key infrastructure elements',
        'Cross-reference satellite observations with other intelligence sources',
      ],
      riskLevel: ['medium', 'high', 'critical', 'medium', 'high'][i % 5],
      confidence: 0.74 + (i % 20) / 100,
      metrics: { facilityCount: `${5 + i * 2}`, activityLevel: ['low', 'moderate', 'high', 'moderate', 'elevated'][i % 5], perimeterIntegrity: `${85 + i}%`, threatLevel: ['low', 'moderate', 'elevated', 'moderate', 'high'][i % 5], surveillanceCoverage: `${70 + i * 2}%` },
    }),
  },
  'water-body-analysis': {
    items: [
      { title: 'Lake Victoria Water Quality', location: 'Lake Victoria, East Africa', coordinates: '-1.0000, 33.0000', description: 'Satellite-based water quality monitoring including turbidity and algal bloom detection.' },
      { title: 'Mississippi River Flood Extent', location: 'Mississippi Delta, USA', coordinates: '29.9511, -90.0715', description: 'Flood extent mapping during high-water events using SAR and optical satellite data.' },
      { title: 'Caspian Sea Level Change', location: 'Caspian Sea', coordinates: '41.0000, 51.0000', description: 'Long-term water level and extent analysis of the Caspian Sea.' },
      { title: 'Lake Titicaca Ecosystem Health', location: 'Lake Titicaca, Peru/Bolivia', coordinates: '-15.8402, -69.3383', description: 'Eutrophication assessment and aquatic vegetation mapping.' },
      { title: 'Yangtze River Reservoir Monitor', location: 'Three Gorges, China', coordinates: '30.8200, 111.0000', description: 'Reservoir capacity monitoring and downstream sediment transport analysis.' },
      { title: 'Lake Baikal Ice Dynamics', location: 'Lake Baikal, Russia', coordinates: '53.5000, 108.0000', description: 'Annual ice formation and break-up timing analysis for climate monitoring.' },
      { title: 'Jordan River Flow Assessment', location: 'Jordan River', coordinates: '32.0000, 35.5000', description: 'Water flow estimation and riparian habitat assessment along the Jordan River.' },
      { title: 'Lake Mead Drought Monitor', location: 'Lake Mead, Nevada', coordinates: '36.1460, -114.3722', description: 'Reservoir level tracking and drought impact assessment.' },
      { title: 'Ganges Delta Salinity Intrusion', location: 'Sundarbans, Bangladesh', coordinates: '21.9497, 89.1833', description: 'Salinity intrusion mapping in the Ganges-Brahmaputra delta.' },
      { title: 'Lake Turkana Water Extent', location: 'Lake Turkana, Kenya', coordinates: '3.5000, 36.0000', description: 'Lake extent monitoring and surrounding wetland ecosystem assessment.' },
      { title: 'Danube River Water Quality', location: 'Danube Delta, Romania', coordinates: '45.0000, 29.5000', description: 'Multi-parameter water quality analysis of the Danube Delta ecosystem.' },
      { title: 'Great Salt Lake Desiccation', location: 'Great Salt Lake, Utah', coordinates: '41.0000, -112.5000', description: 'Water extent change and exposed lakebed dust emission risk analysis.' },
      { title: 'Amazon River Sediment Plume', location: 'Amazon River Mouth, Brazil', coordinates: '0.0000, -49.0000', description: 'Oceanic sediment plume extent and seasonal variation mapping.' },
      { title: 'Lake Poopó Drying Assessment', location: 'Lake Poopó, Bolivia', coordinates: '-18.5000, -67.0833', description: 'Lake desiccation assessment and impacts on local communities.' },
      { title: 'Chesapeake Bay Algal Monitoring', location: 'Chesapeake Bay, USA', coordinates: '37.8000, -76.1000', description: 'Harmful algal bloom detection and water clarity monitoring.' },
    ],
    aiResult: (i) => ({
      summary: 'Water body analysis reveals important hydrological patterns and potential water quality concerns. Seasonal variability and long-term trends are quantified for management planning.',
      findings: [
        'Water surface area has changed by approximately 8% compared to the historical baseline',
        'Turbidity levels are elevated in nearshore areas indicating sediment input from upstream',
        'Algal bloom risk is moderate based on chlorophyll-a concentration estimates',
        'Shoreline erosion is active on the eastern bank with 3m average annual retreat',
        'Water temperature stratification patterns are consistent with seasonal expectations',
      ],
      recommendations: [
        'Establish continuous satellite monitoring program for early algal bloom warning',
        'Implement upstream sediment control measures to reduce turbidity',
        'Monitor shoreline erosion hotspots with quarterly high-resolution imagery',
      ],
      riskLevel: ['medium', 'high', 'medium', 'low', 'high'][i % 5],
      confidence: 0.80 + (i % 17) / 100,
      metrics: { waterAreaKm2: `${150 + i * 20}`, turbidityNTU: `${12 + i * 3}`, algalBloomRisk: ['low', 'moderate', 'high', 'moderate', 'low'][i % 5], shorelineChangeM: `${-3 + i * 0.5}`, waterQualityIndex: `${65 + i * 2}` },
    }),
  },
  'vegetation-index': {
    items: [
      { title: 'Amazon Rainforest NDVI Seasonal', location: 'Amazon Rainforest, Brazil', coordinates: '-3.0000, -60.0000', description: 'Seasonal NDVI variation analysis across the Amazon rainforest ecosystem.' },
      { title: 'Boreal Forest EVI Mapping', location: 'Canadian Boreal Forest', coordinates: '55.0000, -90.0000', description: 'Enhanced Vegetation Index mapping of the Canadian boreal forest zone.' },
      { title: 'Sahel Greening Trend Analysis', location: 'Sahel, West Africa', coordinates: '14.0000, -2.0000', description: 'Multi-decadal vegetation trend analysis detecting re-greening patterns.' },
      { title: 'European Forest Health Survey', location: 'Black Forest, Germany', coordinates: '48.0000, 8.0000', description: 'Forest health assessment using NDVI, EVI, and SAVI indices comparison.' },
      { title: 'Australian Outback Fire Recovery', location: 'Northern Territory, Australia', coordinates: '-19.0000, 134.0000', description: 'Post-fire vegetation recovery tracking using multi-temporal vegetation indices.' },
      { title: 'Congo Basin Canopy Density', location: 'Congo Basin', coordinates: '0.0000, 22.0000', description: 'Tropical forest canopy density estimation from vegetation index calculations.' },
      { title: 'Mediterranean Scrubland Index', location: 'Andalusia, Spain', coordinates: '37.0000, -4.0000', description: 'Mediterranean maquis and garrigue vegetation health monitoring.' },
      { title: 'Indonesian Mangrove Assessment', location: 'Kalimantan Coast, Indonesia', coordinates: '-1.0000, 117.0000', description: 'Mangrove ecosystem health and extent mapping using vegetation indices.' },
      { title: 'Arctic Tundra Greening Study', location: 'Northern Alaska, USA', coordinates: '69.0000, -150.0000', description: 'Tundra vegetation change detection related to Arctic warming.' },
      { title: 'Indian Western Ghats Biodiversity', location: 'Western Ghats, India', coordinates: '12.0000, 76.0000', description: 'Biodiversity hotspot vegetation mapping using multi-index approach.' },
      { title: 'East African Savanna Phenology', location: 'Serengeti, Tanzania', coordinates: '-2.3333, 34.8333', description: 'Savanna vegetation phenological cycle analysis from MODIS time series.' },
      { title: 'Pacific Northwest Old Growth', location: 'Olympic National Forest, USA', coordinates: '47.8000, -123.7000', description: 'Old-growth forest health assessment and stress detection.' },
      { title: 'Cerrado Biome Vegetation Loss', location: 'Cerrado, Brazil', coordinates: '-15.0000, -47.0000', description: 'Cerrado savanna vegetation loss quantification from agricultural expansion.' },
      { title: 'Scandinavian Birch Forest Survey', location: 'Northern Norway', coordinates: '69.0000, 18.0000', description: 'Mountain birch forest health and treeline migration analysis.' },
      { title: 'Central African Woodland Index', location: 'Miombo Woodland, Zambia', coordinates: '-13.0000, 28.0000', description: 'Dry woodland vegetation index monitoring for charcoal production impact.' },
    ],
    aiResult: (i) => ({
      summary: 'Vegetation index analysis provides comprehensive quantification of plant health and phenological status. Multiple indices offer consistent assessment with NDVI serving as the primary indicator.',
      findings: [
        'Average NDVI values indicate healthy vegetation cover with normal seasonal progression',
        'EVI analysis reveals canopy structural variations not captured by NDVI alone',
        'SAVI corrections show improved accuracy in areas with significant bare soil exposure',
        'Leaf area index estimates correlate with ground measurements at r²=0.87',
        'Biomass estimation suggests stable carbon sequestration capacity',
      ],
      recommendations: [
        'Continue multi-temporal monitoring to establish robust phenological baselines',
        'Use EVI for dense canopy areas where NDVI saturates',
        'Integrate ground-based LAI measurements for model calibration',
      ],
      riskLevel: ['low', 'medium', 'low', 'medium', 'low'][i % 5],
      confidence: 0.85 + (i % 12) / 100,
      metrics: { ndvi: `${0.55 + i * 0.02}`, evi: `${0.40 + i * 0.015}`, savi: `${0.50 + i * 0.018}`, leafAreaIndex: `${2.5 + i * 0.3}`, vegetationCoverPct: `${60 + i * 2}`, biomassTonnes: `${120 + i * 15}` },
    }),
  },
  'disaster-assessment': {
    items: [
      { title: 'Turkey Earthquake Damage Assessment', location: 'Gaziantep, Turkey', coordinates: '37.0662, 37.3833', description: 'Post-earthquake building damage assessment and collapse detection using satellite imagery.' },
      { title: 'Hurricane Otis Acapulco Impact', location: 'Acapulco, Mexico', coordinates: '16.8531, -99.8237', description: 'Category 5 hurricane damage assessment across the Acapulco coastal zone.' },
      { title: 'Libya Flood Damage Derna', location: 'Derna, Libya', coordinates: '32.7648, 22.6389', description: 'Flash flood damage assessment following dam failures in Derna.' },
      { title: 'Maui Wildfire Damage Map', location: 'Lahaina, Maui, USA', coordinates: '20.8783, -156.6825', description: 'Building-level damage assessment from the Lahaina wildfire using pre/post imagery.' },
      { title: 'Pakistan Flood Extent 2022', location: 'Sindh Province, Pakistan', coordinates: '26.0000, 68.0000', description: 'Monsoon flood extent mapping and affected population estimation.' },
      { title: 'Japan Noto Earthquake Response', location: 'Noto Peninsula, Japan', coordinates: '37.0000, 137.0000', description: 'Rapid damage assessment following the Noto Peninsula earthquake.' },
      { title: 'Chile Wildfire Emergency', location: 'Valparaíso, Chile', coordinates: '-33.0472, -71.6127', description: 'Wildfire damage assessment in the Valparaíso region.' },
      { title: 'Typhoon Doksuri Vietnam Impact', location: 'Central Vietnam', coordinates: '17.0000, 107.0000', description: 'Typhoon-induced flooding and landslide damage assessment.' },
      { title: 'Iceland Volcanic Eruption Impact', location: 'Grindavík, Iceland', coordinates: '63.8420, -22.4340', description: 'Lava flow impact assessment and evacuation zone validation.' },
      { title: 'Morocco Earthquake Al Haouz', location: 'Al Haouz, Morocco', coordinates: '31.2000, -8.1000', description: 'Rural earthquake damage assessment in mountainous terrain.' },
      { title: 'Australian Cyclone Jasper Damage', location: 'Cairns, Queensland', coordinates: '-16.9186, 145.7781', description: 'Cyclone damage and flooding assessment in Far North Queensland.' },
      { title: 'Brazil Rio Grande do Sul Floods', location: 'Porto Alegre, Brazil', coordinates: '-30.0346, -51.2177', description: 'Urban and rural flood damage assessment from unprecedented rainfall.' },
      { title: 'Taiwan Hualien Earthquake', location: 'Hualien, Taiwan', coordinates: '23.9871, 121.6018', description: 'Building damage and landslide assessment following the Hualien earthquake.' },
      { title: 'Kenya Nairobi Flash Floods', location: 'Nairobi, Kenya', coordinates: '-1.2921, 36.8219', description: 'Flash flood damage assessment in informal settlement areas.' },
      { title: 'Afghanistan Earthquake Response', location: 'Herat, Afghanistan', coordinates: '34.3529, 62.2040', description: 'Rapid damage assessment in remote earthquake-affected areas.' },
    ],
    aiResult: (i) => ({
      summary: 'Disaster assessment reveals significant damage across the affected area with priority zones identified for immediate response. Satellite-based rapid mapping provides critical situational awareness.',
      findings: [
        'Affected area spans approximately 45 square kilometers with varying damage severity',
        'Estimated 2,500 structures show visible damage from satellite imagery analysis',
        'Critical infrastructure including roads and bridges has been impacted in multiple locations',
        'Population displacement estimated at 15,000 based on damage extent and density',
        'Access routes to affected areas are partially blocked requiring alternate logistics',
      ],
      recommendations: [
        'Prioritize search and rescue operations in zones showing complete structural collapse',
        'Establish temporary shelters in identified safe zones north of the affected area',
        'Deploy ground teams to verify satellite-detected damage for needs assessment',
      ],
      riskLevel: ['critical', 'high', 'critical', 'high', 'critical'][i % 5],
      confidence: 0.76 + (i % 20) / 100,
      metrics: { affectedAreaKm2: `${15 + i * 5}`, damageLevel: ['moderate', 'severe', 'catastrophic', 'severe', 'moderate'][i % 5], structuresAffected: `${500 + i * 300}`, populationImpacted: `${5000 + i * 2000}`, recoveryEstimateDays: `${90 + i * 30}` },
    }),
  },
  'infrastructure-detection': {
    items: [
      { title: 'Trans-Siberian Railway Mapping', location: 'Siberia, Russia', coordinates: '55.0000, 82.0000', description: 'Automated railway infrastructure detection along the Trans-Siberian corridor.' },
      { title: 'US Interstate Bridge Inventory', location: 'Eastern United States', coordinates: '38.0000, -80.0000', description: 'Bridge detection and condition assessment from high-resolution satellite imagery.' },
      { title: 'India Solar Farm Detection', location: 'Rajasthan, India', coordinates: '26.9124, 70.9000', description: 'Solar energy infrastructure detection and capacity estimation.' },
      { title: 'West Africa Road Network Map', location: 'West Africa', coordinates: '8.0000, -2.0000', description: 'Rural road network detection for accessibility and development planning.' },
      { title: 'European 5G Tower Mapping', location: 'Western Europe', coordinates: '50.0000, 8.0000', description: 'Communication tower detection for 5G coverage gap analysis.' },
      { title: 'Chinese High-Speed Rail Network', location: 'Eastern China', coordinates: '32.0000, 118.0000', description: 'High-speed rail infrastructure mapping and construction progress monitoring.' },
      { title: 'MENA Pipeline Infrastructure', location: 'Middle East', coordinates: '28.0000, 48.0000', description: 'Oil and gas pipeline route detection and right-of-way monitoring.' },
      { title: 'Sub-Saharan Power Grid Mapping', location: 'East Africa', coordinates: '-5.0000, 35.0000', description: 'Electrical transmission line detection for electrification planning.' },
      { title: 'Amazon Road Encroachment', location: 'Rondônia, Brazil', coordinates: '-10.0000, -63.0000', description: 'Illegal road construction detection in protected forest areas.' },
      { title: 'Central Asia Dam Inventory', location: 'Central Asia', coordinates: '40.0000, 68.0000', description: 'Dam and reservoir infrastructure detection and capacity assessment.' },
      { title: 'UK Wind Farm Mapping', location: 'North Sea, UK', coordinates: '54.0000, 2.0000', description: 'Offshore wind turbine detection and wake effect analysis.' },
      { title: 'Japan Earthquake-Proof Infrastructure', location: 'Tokyo, Japan', coordinates: '35.6762, 139.6503', description: 'Critical infrastructure mapping for seismic resilience assessment.' },
      { title: 'Australian Mining Infrastructure', location: 'Western Australia', coordinates: '-22.0000, 119.0000', description: 'Mining-related infrastructure detection including haul roads and processing facilities.' },
      { title: 'Caribbean Port Infrastructure', location: 'Caribbean Sea', coordinates: '18.0000, -70.0000', description: 'Port and harbor infrastructure assessment for climate resilience.' },
      { title: 'Andean Tunnel Detection', location: 'Andes Mountains', coordinates: '-33.0000, -70.0000', description: 'Mountain tunnel portal detection and access road mapping.' },
    ],
    aiResult: (i) => ({
      summary: 'Infrastructure detection analysis successfully identifies and catalogs built assets across the study area. Automated detection methods achieve high accuracy validated against reference datasets.',
      findings: [
        'Road network extends approximately 2,450 km within the analysis area',
        'Identified 45 bridge structures of varying size and construction type',
        'Building count exceeds 12,000 with classification into residential, commercial, and industrial',
        'Power transmission lines detected spanning 380 km with 120 tower structures',
        'Overall infrastructure condition assessed as moderate based on spectral and geometric analysis',
      ],
      recommendations: [
        'Prioritize detailed inspection of bridge structures showing potential deterioration signatures',
        'Update infrastructure database with newly detected assets from this analysis',
        'Implement periodic monitoring for infrastructure encroaching on protected areas',
      ],
      riskLevel: ['low', 'medium', 'medium', 'low', 'medium'][i % 5],
      confidence: 0.82 + (i % 15) / 100,
      metrics: { roadKm: `${500 + i * 150}`, bridgeCount: `${10 + i * 5}`, buildingCount: `${3000 + i * 1000}`, powerLineKm: `${100 + i * 30}`, infrastructureScore: `${65 + i * 2}` },
    }),
  },
  'air-quality': {
    items: [
      { title: 'Delhi NCR Pollution Monitoring', location: 'Delhi, India', coordinates: '28.6139, 77.2090', description: 'Satellite-derived air quality assessment during winter pollution season.' },
      { title: 'Beijing Air Quality Improvement', location: 'Beijing, China', coordinates: '39.9042, 116.4074', description: 'Long-term air quality trend analysis showing policy intervention impacts.' },
      { title: 'California Wildfire Smoke Plume', location: 'California, USA', coordinates: '38.0000, -121.0000', description: 'Wildfire smoke dispersion tracking and PM2.5 estimation from satellite.' },
      { title: 'Saharan Dust Transport Atlantic', location: 'North Atlantic', coordinates: '20.0000, -40.0000', description: 'Saharan dust aerosol transport monitoring across the Atlantic Ocean.' },
      { title: 'European NO2 Lockdown Analysis', location: 'Europe', coordinates: '50.0000, 10.0000', description: 'Tropospheric NO2 reduction analysis during COVID-19 lockdown periods.' },
      { title: 'Indonesian Peat Fire Haze', location: 'Sumatra, Indonesia', coordinates: '0.0000, 103.0000', description: 'Transboundary haze monitoring from peat fire emissions.' },
      { title: 'Los Angeles Ozone Assessment', location: 'Los Angeles Basin, USA', coordinates: '34.0000, -118.0000', description: 'Tropospheric ozone and precursor analysis from satellite observations.' },
      { title: 'Lagos Industrial Emissions', location: 'Lagos, Nigeria', coordinates: '6.5000, 3.4000', description: 'Industrial emission hotspot identification from satellite NO2 and SO2 data.' },
      { title: 'Po Valley Pollution Trap', location: 'Po Valley, Italy', coordinates: '45.0000, 10.0000', description: 'Winter atmospheric pollution trapping analysis in the Po Valley basin.' },
      { title: 'South Korean Industrial Zone', location: 'Ulsan, South Korea', coordinates: '35.5384, 129.3114', description: 'Petrochemical complex emissions monitoring from satellite.' },
      { title: 'Mexico City Ozone Analysis', location: 'Mexico City, Mexico', coordinates: '19.4326, -99.1332', description: 'High-altitude urban air quality assessment from multiple satellite sensors.' },
      { title: 'Persian Gulf Flaring Detection', location: 'Persian Gulf', coordinates: '27.0000, 50.0000', description: 'Gas flaring detection and emission estimation from nighttime satellite data.' },
      { title: 'Dhaka Brick Kiln Pollution', location: 'Dhaka, Bangladesh', coordinates: '23.8103, 90.4125', description: 'Brick kiln emission impact assessment on urban air quality.' },
      { title: 'Siberian Wildfire Smoke Analysis', location: 'Eastern Siberia, Russia', coordinates: '62.0000, 130.0000', description: 'Boreal wildfire smoke aerosol properties and transport analysis.' },
      { title: 'Johannesburg Mining Dust', location: 'Johannesburg, South Africa', coordinates: '-26.2041, 28.0473', description: 'Mining tailings dust emission monitoring and health impact assessment.' },
    ],
    aiResult: (i) => ({
      summary: 'Air quality analysis from satellite remote sensing reveals spatial patterns of atmospheric pollution. Key emission sources and transport pathways are identified with quantified pollution indicators.',
      findings: [
        'Aerosol optical depth values are elevated above background levels indicating pollution loading',
        'NO2 tropospheric column concentrations show clear correlation with industrial areas',
        'PM2.5 estimates suggest exceedance of WHO guidelines in populated zones',
        'Identified 8 major pollution point sources within the analysis domain',
        'Air quality index estimation indicates moderate to unhealthy conditions for sensitive groups',
      ],
      recommendations: [
        'Implement targeted emission reduction strategies for identified point sources',
        'Deploy ground-based air quality monitors to validate satellite-derived estimates',
        'Establish air quality forecasting using satellite data assimilation',
      ],
      riskLevel: ['high', 'critical', 'high', 'medium', 'high'][i % 5],
      confidence: 0.77 + (i % 20) / 100,
      metrics: { aerosolOpticalDepth: `${0.3 + i * 0.05}`, no2Concentration: `${8 + i * 2} µmol/m²`, pm25Estimate: `${25 + i * 5} µg/m³`, pollutionSourceCount: `${3 + i}`, aqiEstimate: `${80 + i * 10}` },
    }),
  },
  'terrain-analysis': {
    items: [
      { title: 'Andes Mountain DEM Analysis', location: 'Andes Mountains, Peru', coordinates: '-13.1631, -72.5450', description: 'High-resolution digital elevation model analysis for infrastructure route planning.' },
      { title: 'Grand Canyon Erosion Study', location: 'Grand Canyon, USA', coordinates: '36.1069, -112.1129', description: 'Terrain change analysis using multi-temporal DEM comparison.' },
      { title: 'Swiss Alps Avalanche Terrain', location: 'Swiss Alps', coordinates: '46.8182, 8.2275', description: 'Slope analysis for avalanche risk zone delineation.' },
      { title: 'Ethiopian Rift Valley Geology', location: 'Ethiopian Rift Valley', coordinates: '7.5000, 39.0000', description: 'Geological feature extraction and tectonic analysis from terrain data.' },
      { title: 'Appalachian Trail Corridor DEM', location: 'Appalachian Mountains, USA', coordinates: '37.0000, -81.0000', description: 'Terrain analysis for trail maintenance and erosion risk assessment.' },
      { title: 'Japanese Volcanic Terrain Map', location: 'Mount Fuji, Japan', coordinates: '35.3606, 138.7278', description: 'Volcanic terrain morphology analysis and lahar risk assessment.' },
      { title: 'Greenland Subglacial Topography', location: 'Greenland', coordinates: '72.0000, -40.0000', description: 'Subglacial topographic mapping from radar sounding and gravity data.' },
      { title: 'Himalayan Landslide Susceptibility', location: 'Uttarakhand, India', coordinates: '30.0668, 79.0193', description: 'Terrain-based landslide susceptibility mapping for disaster risk reduction.' },
      { title: 'Sahara Sand Dune Migration', location: 'Erg Chebbi, Morocco', coordinates: '31.1500, -3.9700', description: 'Sand dune morphology and migration rate analysis from multi-temporal DEM.' },
      { title: 'Norwegian Fjord Bathymetry', location: 'Sognefjord, Norway', coordinates: '61.2000, 6.5000', description: 'Combined terrestrial and submarine terrain analysis of fjord systems.' },
      { title: 'Korean Peninsula Terrain Intel', location: 'Korean Peninsula', coordinates: '37.5000, 127.0000', description: 'Strategic terrain analysis for mobility and line-of-sight assessments.' },
      { title: 'New Zealand Alpine Fault Zone', location: 'Southern Alps, New Zealand', coordinates: '-43.5000, 170.0000', description: 'Terrain analysis along the Alpine Fault for seismic hazard assessment.' },
      { title: 'Amazon Basin Drainage Analysis', location: 'Amazon Basin', coordinates: '-5.0000, -65.0000', description: 'Watershed delineation and drainage pattern analysis from SRTM data.' },
      { title: 'Kilimanjaro Glacier Terrain', location: 'Mount Kilimanjaro, Tanzania', coordinates: '-3.0674, 37.3556', description: 'High-mountain terrain analysis for glacier retreat and hazard assessment.' },
      { title: 'Colorado Plateau Geology Map', location: 'Colorado Plateau, USA', coordinates: '37.0000, -110.0000', description: 'Geological structure mapping from terrain analysis and spectral data.' },
    ],
    aiResult: (i) => ({
      summary: 'Terrain analysis provides detailed topographic characterization of the study area. Slope, aspect, and drainage analyses support infrastructure planning and natural hazard assessment.',
      findings: [
        'Elevation range within the study area spans from minimum to maximum with average slope of 15 degrees',
        'Drainage density analysis identifies primary watershed boundaries and flow accumulation paths',
        'Steep slopes exceeding 30 degrees are concentrated in the northern sector indicating high erosion risk',
        'Terrain roughness index values suggest challenging conditions for infrastructure development in 35% of the area',
        'Geological lineaments detected from terrain analysis indicate potential fault structures',
      ],
      recommendations: [
        'Avoid steep slope zones for infrastructure routing to minimize cut-and-fill requirements',
        'Implement drainage management in areas with high flow accumulation values',
        'Conduct detailed geotechnical surveys in areas with identified geological lineaments',
      ],
      riskLevel: ['medium', 'high', 'medium', 'low', 'high'][i % 5],
      confidence: 0.84 + (i % 13) / 100,
      metrics: { elevationMinM: `${100 + i * 50}`, elevationMaxM: `${2000 + i * 200}`, avgSlopeDeg: `${8 + i * 2}`, drainageDensity: `${1.5 + i * 0.2}`, terrainRoughnessIndex: `${0.3 + i * 0.05}` },
    }),
  },
  'population-density': {
    items: [
      { title: 'Dhaka Megacity Population Map', location: 'Dhaka, Bangladesh', coordinates: '23.8103, 90.4125', description: 'Building footprint-based population density estimation in one of the world densest cities.' },
      { title: 'Tokyo-Yokohama Urban Density', location: 'Tokyo-Yokohama, Japan', coordinates: '35.4437, 139.6380', description: 'Population density mapping across the Tokyo-Yokohama metropolitan area.' },
      { title: 'Lagos Population Growth Model', location: 'Lagos, Nigeria', coordinates: '6.5244, 3.3792', description: 'Satellite-based population estimation and growth trajectory modeling.' },
      { title: 'Manhattan Block-Level Density', location: 'Manhattan, New York', coordinates: '40.7831, -73.9712', description: 'Ultra-high resolution population density estimation at city block level.' },
      { title: 'Cairo Greater Metro Population', location: 'Greater Cairo, Egypt', coordinates: '30.0444, 31.2357', description: 'Population distribution mapping across formal and informal settlement areas.' },
      { title: 'São Paulo Favela Population', location: 'São Paulo, Brazil', coordinates: '-23.5505, -46.6333', description: 'Informal settlement population estimation using building detection and density models.' },
      { title: 'Mumbai Dharavi Density Study', location: 'Mumbai, India', coordinates: '19.0438, 72.8534', description: 'Population density estimation in one of Asia largest informal settlements.' },
      { title: 'Mexico City Valley Population', location: 'Mexico City, Mexico', coordinates: '19.4326, -99.1332', description: 'Valley-wide population distribution analysis including periurban zones.' },
      { title: 'Karachi Population Estimation', location: 'Karachi, Pakistan', coordinates: '24.8607, 67.0011', description: 'Satellite-derived population estimate for census validation.' },
      { title: 'Jakarta Population Density Map', location: 'Jakarta, Indonesia', coordinates: '-6.2088, 106.8456', description: 'Nighttime light and building density fusion for population mapping.' },
      { title: 'Kinshasa Urban Population', location: 'Kinshasa, DR Congo', coordinates: '-4.4419, 15.2663', description: 'Rapidly growing megacity population density estimation.' },
      { title: 'Delhi NCR Population Map', location: 'Delhi NCR, India', coordinates: '28.7041, 77.1025', description: 'National Capital Region population distribution from satellite indicators.' },
      { title: 'Addis Ababa Growth Mapping', location: 'Addis Ababa, Ethiopia', coordinates: '9.0222, 38.7469', description: 'Urban growth and population density evolution in East Africa fastest growing capital.' },
      { title: 'Manila Metro Density', location: 'Metro Manila, Philippines', coordinates: '14.5995, 120.9842', description: 'Population density mapping in one of the world most densely populated urban areas.' },
      { title: 'Bogotá Strata Population Map', location: 'Bogotá, Colombia', coordinates: '4.7110, -74.0721', description: 'Population density mapping across socioeconomic strata zones.' },
    ],
    aiResult: (i) => ({
      summary: 'Population density estimation using satellite-derived proxies provides valuable demographic insights. Building density, nighttime lights, and land use patterns enable reliable population distribution mapping.',
      findings: [
        'Estimated total population within the study area exceeds baseline census projections by 12%',
        'Highest density zones concentrate in central urban areas exceeding 25,000 persons per km²',
        'Urbanization rate indicates 3.5% annual population growth in periurban transition zones',
        'Nighttime light intensity correlates with population density at r²=0.82',
        'Dwelling unit count from building detection suggests average household size of 4.2 persons',
      ],
      recommendations: [
        'Update census sampling frames using satellite-derived building footprints',
        'Target infrastructure investment in high-growth periurban areas',
        'Implement regular satellite-based population monitoring for planning agencies',
      ],
      riskLevel: ['medium', 'high', 'medium', 'low', 'high'][i % 5],
      confidence: 0.75 + (i % 22) / 100,
      metrics: { estimatedPopulation: `${200000 + i * 50000}`, densityPerKm2: `${5000 + i * 2000}`, urbanizationPct: `${70 + i * 2}`, nightLightIntensity: `${45 + i * 5}`, dwellingCount: `${50000 + i * 10000}` },
    }),
  },
  'mining-resource-detection': {
    items: [
      { title: 'Pilbara Iron Ore Detection', location: 'Pilbara, Western Australia', coordinates: '-22.0000, 118.0000', description: 'Iron ore deposit detection using hyperspectral mineral mapping from satellite.' },
      { title: 'Chilean Copper Belt Survey', location: 'Atacama, Chile', coordinates: '-27.0000, -69.0000', description: 'Copper mineralization indicator mapping in the Chilean copper belt.' },
      { title: 'Congo Cobalt Mining Monitor', location: 'Katanga, DR Congo', coordinates: '-10.5000, 26.0000', description: 'Artisanal and industrial cobalt mining activity detection and monitoring.' },
      { title: 'Nevada Gold Exploration Survey', location: 'Nevada, USA', coordinates: '40.0000, -117.0000', description: 'Geological indicator mapping for gold exploration target identification.' },
      { title: 'Brazilian Rare Earth Detection', location: 'Minas Gerais, Brazil', coordinates: '-19.0000, -44.0000', description: 'Rare earth element indicator mineral detection from hyperspectral data.' },
      { title: 'South African Platinum Group', location: 'Bushveld Complex, South Africa', coordinates: '-25.0000, 29.0000', description: 'Platinum group element exploration support using geological remote sensing.' },
      { title: 'Indonesian Nickel Mining Impact', location: 'Sulawesi, Indonesia', coordinates: '-2.5000, 121.5000', description: 'Nickel laterite mining site monitoring and environmental impact assessment.' },
      { title: 'Mongolian Copper-Gold Survey', location: 'Gobi Desert, Mongolia', coordinates: '43.0000, 107.0000', description: 'Oyu Tolgoi region mineral exploration support using satellite spectral analysis.' },
      { title: 'Zambian Copper Belt Monitor', location: 'Copperbelt Province, Zambia', coordinates: '-12.8000, 28.2000', description: 'Active copper mining operation monitoring and tailings management assessment.' },
      { title: 'Canadian Diamond Indicator Map', location: 'Northwest Territories, Canada', coordinates: '64.0000, -110.0000', description: 'Kimberlite pipe detection using geological structure analysis.' },
      { title: 'Peruvian Lithium Brine Survey', location: 'Puno, Peru', coordinates: '-15.8402, -70.0219', description: 'Lithium brine deposit detection in high-altitude salt flats.' },
      { title: 'Guinea Bauxite Mining Tracking', location: 'Boké, Guinea', coordinates: '10.9400, -14.2900', description: 'Bauxite mining expansion monitoring and deforestation impact assessment.' },
      { title: 'Myanmar Jade Mining Detection', location: 'Kachin State, Myanmar', coordinates: '25.5000, 96.5000', description: 'Jade mining activity detection in conflict-affected areas.' },
      { title: 'Kazakhstan Uranium Site Monitor', location: 'Kazakhstan', coordinates: '48.0000, 68.0000', description: 'In-situ uranium recovery site monitoring and environmental compliance.' },
      { title: 'Swedish REE Deposit Survey', location: 'Kiruna, Sweden', coordinates: '67.8558, 20.2253', description: 'Rare earth element deposit characterization from satellite geological mapping.' },
    ],
    aiResult: (i) => ({
      summary: 'Mining and resource detection analysis identifies geological indicators and active extraction sites. Spectral analysis and change detection provide insights for exploration and environmental monitoring.',
      findings: [
        'Identified geological indicators consistent with potential mineralization in target zones',
        'Active mining sites detected covering approximately 25 km² with visible extraction activity',
        'Environmental disturbance from mining extends beyond permitted boundaries in some areas',
        'Spectral analysis reveals alteration minerals indicative of hydrothermal systems',
        'Tailings management appears adequate with contained waste storage facilities detected',
      ],
      recommendations: [
        'Conduct ground-based geochemical sampling at satellite-identified prospective targets',
        'Monitor mining site boundaries quarterly for unauthorized expansion',
        'Assess reclamation progress at inactive mining sites and enforce rehabilitation timelines',
      ],
      riskLevel: ['medium', 'high', 'medium', 'high', 'critical'][i % 5],
      confidence: 0.73 + (i % 24) / 100,
      metrics: { miningSiteCount: `${2 + i}`, disturbedAreaKm2: `${5 + i * 3}`, resourcePotential: ['low', 'moderate', 'high', 'very high', 'moderate'][i % 5], environmentalImpact: ['low', 'moderate', 'significant', 'moderate', 'high'][i % 5], reclamationPct: `${20 + i * 5}` },
    }),
  },
};

function requireDemoPassword() {
  const password = process.env.DEMO_PASSWORD || process.env.SEED_DEMO_PASSWORD || process.env.DEMO_SEED_PASSWORD || '';
  if (password.length < 12 || password.length > 1024) throw new Error('DEMO_PASSWORD must contain 12-1024 characters');
  return password;
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Starting database seed...');

    // Create tables
    await client.query(`
      DROP TABLE IF EXISTS analyses CASCADE;
      DROP TABLE IF EXISTS users CASCADE;

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'analyst',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE analyses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        location VARCHAR(500),
        coordinates VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        ai_result JSONB,
        image_url VARCHAR(1000),
        metadata JSONB,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_analyses_category ON analyses(category);
      CREATE INDEX idx_analyses_status ON analyses(status);
      CREATE INDEX idx_analyses_created_by ON analyses(created_by);
      CREATE INDEX idx_analyses_created_at ON analyses(created_at);
    `);
    console.log('Tables created successfully.');

    // Seed demo user
    const hashedPassword = await bcrypt.hash(requireDemoPassword(), 12);
    const userResult = await client.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['admin@satellite.ai', hashedPassword, 'Admin User', 'admin']
    );
    const userId = userResult.rows[0].id;
    console.log(`Demo user created with id: ${userId}`);

    // Seed analyses
    let insertCount = 0;
    for (const category of CATEGORIES) {
      const catData = SEED_DATA[category];
      for (let i = 0; i < catData.items.length; i++) {
        const item = catData.items[i];
        const status = STATUSES[i % STATUSES.length];
        const priority = PRIORITIES[i % PRIORITIES.length];
        const aiResult = (status === 'completed') ? catData.aiResult(i) : null;

        // Create realistic timestamps spread over the last 6 months
        const daysAgo = Math.floor(Math.random() * 180);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        await client.query(
          `INSERT INTO analyses (title, description, category, location, coordinates, status, priority, ai_result, image_url, metadata, created_by, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            item.title,
            item.description,
            category,
            item.location,
            item.coordinates,
            status,
            priority,
            aiResult ? JSON.stringify(aiResult) : null,
            null,
            JSON.stringify({ source: 'seed', version: '1.0' }),
            userId,
            createdAt,
            createdAt,
          ]
        );
        insertCount++;
      }
      console.log(`  Seeded 15 items for category: ${category}`);
    }

    console.log(`\nSeed complete! Created ${insertCount} analyses across ${CATEGORIES.length} categories.`);
    console.log('\nDemo credentials:');
    console.log('  Email: admin@satellite.ai');
    console.log('Demo login users provisioned from the local environment.');
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
