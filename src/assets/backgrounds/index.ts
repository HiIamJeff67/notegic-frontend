import cloudyRidge from "./cloudy-ridge.webp";
import coastalShore from "./coastal-shore.webp";
import goldenClouds from "./golden-clouds.webp";
import mistyMountains from "./misty-mountains.webp";
import mountainRiver from "./mountain-river.webp";
import overcastCrane from "./overcast-crane.webp";
import ripplingWater from "./rippling-water.gif";
import riverBridge from "./river-bridge.webp";
import summerBay from "./summer-bay.webp";
import sunnyCampus from "./sunny-campus.webp";
import sunsetCloudSea from "./sunset-cloud-sea.webp";
import templeSky from "./temple-sky.webp";

export const dashboardHeaderBackgroundImages = [
  cloudyRidge,
  coastalShore,
  goldenClouds,
  mistyMountains,
  mountainRiver,
  overcastCrane,
  ripplingWater,
  riverBridge,
  summerBay,
  sunnyCampus,
  sunsetCloudSea,
  templeSky,
];

export const dashboardHeaderBackgroundImageOptions =
  dashboardHeaderBackgroundImages.map((src, index) => ({
    id: `default-${index}`,
    src,
  }));
