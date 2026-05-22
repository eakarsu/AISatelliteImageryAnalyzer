import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import FeatureListPage from './pages/FeatureListPage'
import AnalysisDetailPage from './pages/AnalysisDetailPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import BookmarksPage from './pages/BookmarksPage'
import ActivityPage from './pages/ActivityPage'
import MapViewPage from './pages/MapViewPage'
import ComparisonPage from './pages/ComparisonPage'
import ReportsPage from './pages/ReportsPage'
import SharedViewPage from './pages/SharedViewPage'
import ChangeDetectionPage from './pages/ChangeDetectionPage'
import TimelinePage from './pages/TimelinePage'
import VegetationIndexPage from './pages/VegetationIndexPage'
import AreaCalculationPage from './pages/AreaCalculationPage'
import ObjectDetectionPage from './pages/ObjectDetectionPage'
import TemporalAnalysisPage from './pages/TemporalAnalysisPage'
import CustomViewsPage from './pages/CustomViewsPage'

// === Batch 07 Gaps & Frontend Mounts ===
import CfAutomatedChangeDetection from './pages/CfAutomatedChangeDetection';
import CfAiAssetInventory from './pages/CfAiAssetInventory';
import CfCropHealthMonitoring from './pages/CfCropHealthMonitoring';
import CfUrbanPlanningIntelligence from './pages/CfUrbanPlanningIntelligence';
import CfDisasterDamageAssessment from './pages/CfDisasterDamageAssessment';
import CfEnvironmentalMonitoring from './pages/CfEnvironmentalMonitoring';
import GapNoChangedetectionBeforeafter from './pages/GapNoChangedetectionBeforeafter';
import GapNoObjectdetectionBuildingsRoadsVehicles from './pages/GapNoObjectdetectionBuildingsRoadsVehicles';
import GapNoVegetationindexNdviCropHealth from './pages/GapNoVegetationindexNdviCropHealth';
import GapNoCloudremoval from './pages/GapNoCloudremoval';
import GapNoTemporalanalysisMultidateTrends from './pages/GapNoTemporalanalysisMultidateTrends';
import GapNoAreacalculationMeasureFeatures from './pages/GapNoAreacalculationMeasureFeatures';
import GapNoSegmentationclassificationModels from './pages/GapNoSegmentationclassificationModels';
import GapNoMapIntegrationLeafletmapboxBackendLay from './pages/GapNoMapIntegrationLeafletmapboxBackendLay';
import GapNoGeospatialExportGeotiffShapefiles from './pages/GapNoGeospatialExportGeotiffShapefiles';
import GapNoLayerManagementoverlaySystem from './pages/GapNoLayerManagementoverlaySystem';
import GapNoRoiDrawingmeasurementPersistence from './pages/GapNoRoiDrawingmeasurementPersistence';
import GapNoImageryProviderApiPlanetMaxarSentine from './pages/GapNoImageryProviderApiPlanetMaxarSentine';
import GapNoWebhookDeliveryForCompletedBatchJobs from './pages/GapNoWebhookDeliveryForCompletedBatchJobs';
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

// === End Batch 07 ===


function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feature/:category"
        element={
          <ProtectedRoute>
            <FeatureListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feature/:category/:id"
        element={
          <ProtectedRoute>
            <AnalysisDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <BookmarksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <ActivityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <MapViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compare"
        element={
          <ProtectedRoute>
            <ComparisonPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/shared/:token" element={<SharedViewPage />} />
      <Route
        path="/change-detection"
        element={<ProtectedRoute><ChangeDetectionPage /></ProtectedRoute>}
      />
      <Route
        path="/timeline"
        element={<ProtectedRoute><TimelinePage /></ProtectedRoute>}
      />
      <Route
        path="/vegetation-index"
        element={<ProtectedRoute><VegetationIndexPage /></ProtectedRoute>}
      />
      <Route
        path="/area-calculation"
        element={<ProtectedRoute><AreaCalculationPage /></ProtectedRoute>}
      />
      <Route
        path="/object-detection"
        element={<ProtectedRoute><ObjectDetectionPage /></ProtectedRoute>}
      />
      <Route
        path="/temporal-analysis"
        element={<ProtectedRoute><TemporalAnalysisPage /></ProtectedRoute>}
      />
      <Route
        path="/custom-views"
        element={<ProtectedRoute><CustomViewsPage /></ProtectedRoute>}
      />

      {/* === Batch 07 Gaps & Frontend Mounts === */}
      <Route path='/cf-automated-change-detection' element={<ProtectedRoute><CfAutomatedChangeDetection /></ProtectedRoute>} />
      <Route path='/cf-ai-asset-inventory' element={<ProtectedRoute><CfAiAssetInventory /></ProtectedRoute>} />
      <Route path='/cf-crop-health-monitoring' element={<ProtectedRoute><CfCropHealthMonitoring /></ProtectedRoute>} />
      <Route path='/cf-urban-planning-intelligence' element={<ProtectedRoute><CfUrbanPlanningIntelligence /></ProtectedRoute>} />
      <Route path='/cf-disaster-damage-assessment' element={<ProtectedRoute><CfDisasterDamageAssessment /></ProtectedRoute>} />
      <Route path='/cf-environmental-monitoring' element={<ProtectedRoute><CfEnvironmentalMonitoring /></ProtectedRoute>} />
      <Route path='/gap-no-changedetection-beforeafter' element={<ProtectedRoute><GapNoChangedetectionBeforeafter /></ProtectedRoute>} />
      <Route path='/gap-no-objectdetection-buildings-roads-vehicles' element={<ProtectedRoute><GapNoObjectdetectionBuildingsRoadsVehicles /></ProtectedRoute>} />
      <Route path='/gap-no-vegetationindex-ndvi-crop-health' element={<ProtectedRoute><GapNoVegetationindexNdviCropHealth /></ProtectedRoute>} />
      <Route path='/gap-no-cloudremoval' element={<ProtectedRoute><GapNoCloudremoval /></ProtectedRoute>} />
      <Route path='/gap-no-temporalanalysis-multidate-trends' element={<ProtectedRoute><GapNoTemporalanalysisMultidateTrends /></ProtectedRoute>} />
      <Route path='/gap-no-areacalculation-measure-features' element={<ProtectedRoute><GapNoAreacalculationMeasureFeatures /></ProtectedRoute>} />
      <Route path='/gap-no-segmentationclassification-models' element={<ProtectedRoute><GapNoSegmentationclassificationModels /></ProtectedRoute>} />
      <Route path='/gap-no-map-integration-leafletmapbox-backend-lay' element={<ProtectedRoute><GapNoMapIntegrationLeafletmapboxBackendLay /></ProtectedRoute>} />
      <Route path='/gap-no-geospatial-export-geotiff-shapefiles' element={<ProtectedRoute><GapNoGeospatialExportGeotiffShapefiles /></ProtectedRoute>} />
      <Route path='/gap-no-layer-managementoverlay-system' element={<ProtectedRoute><GapNoLayerManagementoverlaySystem /></ProtectedRoute>} />
      <Route path='/gap-no-roi-drawingmeasurement-persistence' element={<ProtectedRoute><GapNoRoiDrawingmeasurementPersistence /></ProtectedRoute>} />
      <Route path='/gap-no-imagery-provider-api-planet-maxar-sentine' element={<ProtectedRoute><GapNoImageryProviderApiPlanetMaxarSentine /></ProtectedRoute>} />
      <Route path='/gap-no-webhook-delivery-for-completed-batch-jobs' element={<ProtectedRoute><GapNoWebhookDeliveryForCompletedBatchJobs /></ProtectedRoute>} />
      {/* === End Batch 07 === */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
