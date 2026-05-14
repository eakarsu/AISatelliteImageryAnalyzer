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
      <Route path="*" element={<Navigate to="/" replace />} />
          // === Batch 07 Gaps & Frontend Mounts ===
          <Route path='/cf-automated-change-detection' element={<CfAutomatedChangeDetection />} />
          <Route path='/cf-ai-asset-inventory' element={<CfAiAssetInventory />} />
          <Route path='/cf-crop-health-monitoring' element={<CfCropHealthMonitoring />} />
          <Route path='/cf-urban-planning-intelligence' element={<CfUrbanPlanningIntelligence />} />
          <Route path='/cf-disaster-damage-assessment' element={<CfDisasterDamageAssessment />} />
          <Route path='/cf-environmental-monitoring' element={<CfEnvironmentalMonitoring />} />
          <Route path='/gap-no-changedetection-beforeafter' element={<GapNoChangedetectionBeforeafter />} />
          <Route path='/gap-no-objectdetection-buildings-roads-vehicles' element={<GapNoObjectdetectionBuildingsRoadsVehicles />} />
          <Route path='/gap-no-vegetationindex-ndvi-crop-health' element={<GapNoVegetationindexNdviCropHealth />} />
          <Route path='/gap-no-cloudremoval' element={<GapNoCloudremoval />} />
          <Route path='/gap-no-temporalanalysis-multidate-trends' element={<GapNoTemporalanalysisMultidateTrends />} />
          <Route path='/gap-no-areacalculation-measure-features' element={<GapNoAreacalculationMeasureFeatures />} />
          <Route path='/gap-no-segmentationclassification-models' element={<GapNoSegmentationclassificationModels />} />
          <Route path='/gap-no-map-integration-leafletmapbox-backend-lay' element={<GapNoMapIntegrationLeafletmapboxBackendLay />} />
          <Route path='/gap-no-geospatial-export-geotiff-shapefiles' element={<GapNoGeospatialExportGeotiffShapefiles />} />
          <Route path='/gap-no-layer-managementoverlay-system' element={<GapNoLayerManagementoverlaySystem />} />
          <Route path='/gap-no-roi-drawingmeasurement-persistence' element={<GapNoRoiDrawingmeasurementPersistence />} />
          <Route path='/gap-no-imagery-provider-api-planet-maxar-sentine' element={<GapNoImageryProviderApiPlanetMaxarSentine />} />
          <Route path='/gap-no-webhook-delivery-for-completed-batch-jobs' element={<GapNoWebhookDeliveryForCompletedBatchJobs />} />
          // === End Batch 07 ===
    </Routes>
  )
}
