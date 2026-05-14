const axios = require('axios');
const fs = require('fs');
const path = require('path');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const CATEGORY_PROMPTS = {
  'satellite-image-analysis': {
    system: 'You are an expert satellite imagery analyst. Analyze the provided satellite image data and provide detailed observations about terrain, structures, land features, and any notable patterns visible from orbital perspective.',
    metricKeys: ['resolution', 'cloudCoverage', 'spectralBands', 'areaKm2', 'imageQuality'],
  },
  'land-use-classification': {
    system: 'You are a land-use classification specialist. Classify the land use types present in the satellite data, including residential, commercial, industrial, agricultural, forest, water bodies, and barren land. Provide percentage breakdowns.',
    metricKeys: ['residentialPct', 'commercialPct', 'agriculturalPct', 'forestPct', 'waterPct', 'barrenPct'],
  },
  'change-detection': {
    system: 'You are a geospatial change detection analyst. Compare temporal satellite data to identify and quantify changes in land cover, urban expansion, deforestation, or other environmental modifications over time.',
    metricKeys: ['changeAreaKm2', 'changePct', 'timeSpanDays', 'majorChangeType', 'confidenceScore'],
  },
  'crop-health-monitoring': {
    system: 'You are a precision agriculture specialist. Analyze crop health indicators from satellite multispectral data including NDVI values, chlorophyll content, water stress levels, and disease detection.',
    metricKeys: ['ndviAvg', 'ndviMin', 'ndviMax', 'waterStressIndex', 'chlorophyllLevel', 'healthyAreaPct'],
  },
  'urban-planning': {
    system: 'You are an urban planning analyst using satellite imagery. Evaluate urban sprawl, infrastructure density, green space distribution, traffic patterns, and zoning compliance from orbital data.',
    metricKeys: ['builtUpAreaPct', 'greenSpacePct', 'roadDensity', 'populationEstimate', 'growthRate'],
  },
  'climate-impact': {
    system: 'You are a climate impact assessment specialist. Analyze satellite data for climate change indicators including ice coverage changes, sea level markers, temperature anomalies, and carbon sink assessments.',
    metricKeys: ['temperatureAnomaly', 'iceCoveragePct', 'seaLevelChange', 'carbonIndex', 'albedoChange'],
  },
  'defense-security': {
    system: 'You are a defense and security imagery analyst. Assess satellite imagery for security-relevant observations including facility identification, activity patterns, perimeter integrity, and strategic assessments.',
    metricKeys: ['facilityCount', 'activityLevel', 'perimeterIntegrity', 'threatLevel', 'surveillanceCoverage'],
  },
  'water-body-analysis': {
    system: 'You are a hydrological analyst specializing in satellite-based water body assessment. Analyze water extent, turbidity, algal bloom presence, shoreline changes, and water quality indicators.',
    metricKeys: ['waterAreaKm2', 'turbidityNTU', 'algalBloomRisk', 'shorelineChangeM', 'waterQualityIndex'],
  },
  'vegetation-index': {
    system: 'You are a vegetation remote sensing specialist. Calculate and interpret vegetation indices (NDVI, EVI, SAVI) from multispectral satellite data to assess vegetation health, density, and seasonal patterns.',
    metricKeys: ['ndvi', 'evi', 'savi', 'leafAreaIndex', 'vegetationCoverPct', 'biomassTonnes'],
  },
  'disaster-assessment': {
    system: 'You are a disaster response imagery analyst. Assess satellite imagery for damage extent from natural disasters including floods, earthquakes, hurricanes, wildfires, and landslides. Prioritize affected areas.',
    metricKeys: ['affectedAreaKm2', 'damageLevel', 'structuresAffected', 'populationImpacted', 'recoveryEstimateDays'],
  },
  'infrastructure-detection': {
    system: 'You are an infrastructure detection specialist. Identify and catalog infrastructure elements from satellite imagery including roads, bridges, buildings, power lines, pipelines, and communication towers.',
    metricKeys: ['roadKm', 'bridgeCount', 'buildingCount', 'powerLineKm', 'infrastructureScore'],
  },
  'air-quality': {
    system: 'You are an atmospheric analyst using satellite remote sensing. Assess air quality indicators including aerosol optical depth, NO2 concentrations, PM2.5 estimates, and pollution source identification.',
    metricKeys: ['aerosolOpticalDepth', 'no2Concentration', 'pm25Estimate', 'pollutionSourceCount', 'aqiEstimate'],
  },
  'terrain-analysis': {
    system: 'You are a terrain analysis specialist using satellite-derived elevation data. Analyze topography, slope gradients, drainage patterns, soil composition indicators, and geological features.',
    metricKeys: ['elevationMinM', 'elevationMaxM', 'avgSlopeDeg', 'drainageDensity', 'terrainRoughnessIndex'],
  },
  'population-density': {
    system: 'You are a population density estimation specialist. Use satellite imagery indicators including building density, night-time lights, road networks, and land use patterns to estimate population distribution.',
    metricKeys: ['estimatedPopulation', 'densityPerKm2', 'urbanizationPct', 'nightLightIntensity', 'dwellingCount'],
  },
  'mining-resource-detection': {
    system: 'You are a mining and natural resource detection analyst. Identify potential mineral deposits, active mining sites, resource extraction impacts, and geological indicators from satellite data.',
    metricKeys: ['miningSiteCount', 'disturbedAreaKm2', 'resourcePotential', 'environmentalImpact', 'reclamationPct'],
  },
};

/**
 * 3-strategy JSON parser for AI responses
 */
function parseAIJson(text) {
  if (!text) throw new Error('Empty AI response');

  // Strategy 1: Direct parse
  try { return JSON.parse(text); } catch (_) {}

  // Strategy 2: Strip markdown fences
  try {
    const stripped = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(stripped);
  } catch (_) {}

  // Strategy 3: Extract first JSON object or array
  try {
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) return JSON.parse(match[0]);
  } catch (_) {}

  throw new Error('Failed to parse AI response as JSON');
}

async function analyzeWithAI(category, data, imageFilePath = null) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
  const categoryConfig = CATEGORY_PROMPTS[category];

  if (!categoryConfig) {
    throw new Error(`Unknown analysis category: ${category}`);
  }

  const textPrompt = `Analyze the following satellite imagery data and provide a structured analysis result.

Title: ${data.title || 'Untitled Analysis'}
Description: ${data.description || 'No description provided'}
Location: ${data.location || 'Unknown'}
Coordinates: ${data.coordinates || 'Not specified'}
Additional metadata: ${JSON.stringify(data.metadata || {})}

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{
  "summary": "A 2-3 sentence professional summary of the analysis",
  "findings": ["finding 1", "finding 2", "finding 3", "finding 4", "finding 5"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "riskLevel": "low|medium|high|critical",
  "confidence": 0.85,
  "metrics": {
    ${categoryConfig.metricKeys.map((k) => `"${k}": "<appropriate value>"`).join(',\n    ')}
  }
}`;

  // Build messages with optional image
  let userContent;
  if (imageFilePath) {
    // Read image file and convert to base64
    try {
      const absolutePath = imageFilePath.startsWith('/') ? imageFilePath : path.join(__dirname, '..', imageFilePath);
      const imageBuffer = fs.readFileSync(absolutePath);
      const base64Image = imageBuffer.toString('base64');

      // Detect media type from extension
      const ext = path.extname(absolutePath).toLowerCase();
      const mediaTypeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
      const mediaType = mediaTypeMap[ext] || 'image/jpeg';

      userContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Image,
          },
        },
        { type: 'text', text: textPrompt },
      ];
    } catch (imgErr) {
      console.warn('Failed to read image file, proceeding without vision:', imgErr.message);
      userContent = textPrompt;
    }
  } else {
    userContent = textPrompt;
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model,
        messages: [
          { role: 'system', content: categoryConfig.system },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'AI Satellite Imagery Analyzer',
        },
        timeout: 60000,
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenRouter');
    }

    const parsed = parseAIJson(content);

    return {
      summary: parsed.summary || 'Analysis completed',
      findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      riskLevel: parsed.riskLevel || 'medium',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.75,
      metrics: parsed.metrics || {},
      analyzedAt: new Date().toISOString(),
      model,
      visionUsed: !!imageFilePath,
    };
  } catch (err) {
    if (err.response) {
      console.error('OpenRouter API error:', err.response.status, err.response.data);
      throw new Error(`OpenRouter API error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    }
    if (err instanceof SyntaxError) {
      console.error('Failed to parse AI response as JSON');
      throw new Error('AI returned invalid JSON response');
    }
    throw err;
  }
}

module.exports = { analyzeWithAI, CATEGORY_PROMPTS, parseAIJson };
