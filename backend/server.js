const path=require('path');
require('dotenv').config({path:path.join(__dirname,'..','.env')});
const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const auth=require('./middleware/auth');
const {validateRuntime}=require('./governance/runtime');
const {createProviderGate}=require('./governance/providerGate');

validateRuntime();

const app=express();
const PORT=process.env.BACKEND_PORT||4000;
const origins=String(process.env.CORS_ORIGINS||process.env.CLIENT_URL||process.env.FRONTEND_URL||'http://localhost:3000').split(',').map((value)=>value.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({origin(origin,callback){if(!origin||origins.includes(origin))return callback(null,true);return callback(new Error('CORS origin denied'));},credentials:true}));
app.use(express.json({limit:'1mb'}));
app.use('/api/auth',require('./routes/auth'));
app.get('/api/health',(_req,res)=>res.json({status:'ok',timestamp:new Date().toISOString()}));
app.use(createProviderGate(['/api/ai','/api/gap','/api/imagery-ai','/api/compare']));
app.use('/api/governed-imagery-releases',require('./governance/router'));
app.use('/api',auth);
app.use('/uploads',auth,express.static(path.join(__dirname,'uploads')));

for(const [route,moduleName] of [
  ['/api/analyses','analyses'],['/api/dashboard','dashboard'],['/api/profile','profile'],['/api/bookmarks','bookmarks'],
  ['/api/notes','notes'],['/api/tags','tags'],['/api/activity','activity'],['/api/notifications','notifications'],
  ['/api/share','share'],['/api/export','export'],['/api/upload','upload'],['/api/batch','batch'],
  ['/api/timeline','timeline'],['/api/custom-views','customViews'],
]) app.use(route,require(`./routes/${moduleName}`));

if(process.env.ENABLE_LEGACY_SCHEMA_BOOTSTRAP==='true'){
  require('./migrate')().catch((error)=>console.error('Legacy schema bootstrap failed:',error.message));
}
if(process.env.ENABLE_LEGACY_PROVIDER_ROUTES==='true'){
  app.use('/api/imagery-ai',require('./routes/imageryAi'));
  app.use('/api/compare',require('./routes/compare'));
  app.use('/api/ai/change-detection',require('./routes/ai-change-detection'));
  app.use('/api/gap-no-changedetection-beforeafter',require('./routes/gap-no-changedetection-beforeafter'));
  app.use('/api/gap-no-objectdetection-buildings-roads-vehicles',require('./routes/gap-no-objectdetection-buildings-roads-vehicles'));
  app.use('/api/gap-no-vegetationindex-ndvi-crop-health',require('./routes/gap-no-vegetationindex-ndvi-crop-health'));
  app.use('/api/gap-no-cloudremoval',require('./routes/gap-no-cloudremoval'));
  app.use('/api/gap-no-temporalanalysis-multidate-trends',require('./routes/gap-no-temporalanalysis-multidate-trends'));
  app.use('/api/gap-no-areacalculation-measure-features',require('./routes/gap-no-areacalculation-measure-features'));
  app.use('/api/gap-no-segmentationclassification-models',require('./routes/gap-no-segmentationclassification-models'));
  app.use('/api/gap-no-map-integration-leafletmapbox-backend-lay',require('./routes/gap-no-map-integration-leafletmapbox-backend-lay'));
  app.use('/api/gap-no-geospatial-export-geotiff-shapefiles',require('./routes/gap-no-geospatial-export-geotiff-shapefiles'));
  app.use('/api/gap-no-layer-managementoverlay-system',require('./routes/gap-no-layer-managementoverlay-system'));
  app.use('/api/gap-no-roi-drawingmeasurement-persistence',require('./routes/gap-no-roi-drawingmeasurement-persistence'));
  app.use('/api/gap-no-imagery-provider-api-planet-maxar-sentine',require('./routes/gap-no-imagery-provider-api-planet-maxar-sentine'));
  app.use('/api/gap-no-webhook-delivery-for-completed-batch-jobs',require('./routes/gap-no-webhook-delivery-for-completed-batch-jobs'));
}
app.use((err,_req,res,_next)=>{console.error('Unhandled error:',err.message);res.status(err.status||500).json({error:err.status?err.message:'Internal server error'});});
app.use((_req,res)=>res.status(404).json({error:'Route not found'}));
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
module.exports=app;
