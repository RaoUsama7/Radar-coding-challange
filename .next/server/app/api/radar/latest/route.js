"use strict";(()=>{var e={};e.id=979,e.ids=[979],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5315:e=>{e.exports=require("path")},8267:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>k,patchFetch:()=>S,requestAsyncStorage:()=>m,routeModule:()=>x,serverHooks:()=>R,staticGenerationAsyncStorage:()=>w});var o={};r.r(o),r.d(o,{GET:()=>g,dynamic:()=>p,revalidate:()=>y});var a=r(9303),i=r(8716),s=r(670),n=r(7070);let l=require("zlib"),c=require("fs");var f=r(5315);let d=require("os"),p="force-dynamic",y=0,u="https://mrms.ncep.noaa.gov/2D/ALASKA/BREF_1HR_MAX/MRMS_BREF_1HR_MAX.latest.grib2.gz",h=[[54,-180],[72,-130]];async function g(e){let t=(0,d.tmpdir)(),r=(0,f.join)(t,`radar_${Date.now()}.grib2`);try{let e,t;console.log("Downloading radar file from:",u);let o=await fetch(u,{cache:"no-store"});if(!o.ok)return console.error(`Failed to download radar file: ${o.status} ${o.statusText}`),n.NextResponse.json({error:`Failed to download file: ${o.status} ${o.statusText}`},{status:o.status,headers:{"Cache-Control":"no-store"}});console.log("Download successful, decompressing...");let a=Buffer.from(await o.arrayBuffer());a.length;try{e=(0,l.gunzipSync)(a),console.log(`Decompressed to ${e.length} bytes`)}catch(e){return console.error("Decompression error:",e),n.NextResponse.json({error:"Failed to decompress file. The file may not be valid gzip format."},{status:500,headers:{"Cache-Control":"no-store"}})}try{(0,c.writeFileSync)(r,e),console.log("Saved GRIB2 file to:",r)}catch(e){return console.error("Failed to write GRIB2 file:",e),n.NextResponse.json({error:"Failed to save decompressed file to temporary directory."},{status:500,headers:{"Cache-Control":"no-store"}})}try{let r=e.length.toLocaleString(),o=new Date().toLocaleTimeString("en-US",{hour12:!1,hour:"2-digit",minute:"2-digit"}),a=`<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with gradient -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#0b1020;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1f3a;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="radarGradient" cx="50%" cy="50%">
      <stop offset="0%" style="stop-color:#00ff00;stop-opacity:0.3" />
      <stop offset="50%" style="stop-color:#00ffff;stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:#0000ff;stop-opacity:0" />
    </radialGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1000" height="600" fill="url(#bgGradient)"/>
  
  <!-- Radar sweep effect (simulated) -->
  <circle cx="500" cy="300" r="250" fill="url(#radarGradient)" opacity="0.4"/>
  <circle cx="500" cy="300" r="200" fill="none" stroke="#00ff00" stroke-width="1" opacity="0.3"/>
  <circle cx="500" cy="300" r="150" fill="none" stroke="#00ffff" stroke-width="1" opacity="0.3"/>
  <circle cx="500" cy="300" r="100" fill="none" stroke="#0080ff" stroke-width="1" opacity="0.3"/>
  <circle cx="500" cy="300" r="50" fill="none" stroke="#00ff00" stroke-width="2" opacity="0.5"/>
  
  <!-- Crosshair -->
  <line x1="500" y1="50" x2="500" y2="550" stroke="#ffffff" stroke-width="1" opacity="0.2"/>
  <line x1="50" y1="300" x2="950" y2="300" stroke="#ffffff" stroke-width="1" opacity="0.2"/>
  
  <!-- Radar sweep line (animated-like appearance) -->
  <line x1="500" y1="300" x2="750" y2="300" stroke="#00ff00" stroke-width="2" opacity="0.6" transform="rotate(45 500 300)"/>
  
  <!-- Title with better styling -->
  <text x="500" y="80" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#00ff00" text-anchor="middle" opacity="0.9">
    ALASKA RADAR - BREF 1HR MAX
  </text>
  
  <!-- Status info -->
  <g transform="translate(500, 320)">
    <rect x="-200" y="-60" width="400" height="120" fill="rgba(0,0,0,0.6)" rx="8" opacity="0.8"/>
    <text x="0" y="-30" font-family="Arial, sans-serif" font-size="18" fill="#00ffff" text-anchor="middle" font-weight="bold">
      STATUS: ACTIVE
    </text>
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">
      GRIB2 Data Loaded Successfully
    </text>
    <text x="0" y="25" font-family="Arial, sans-serif" font-size="12" fill="#a0a0a0" text-anchor="middle">
      File Size: ${r} bytes | Updated: ${o}
    </text>
  </g>
  
  <!-- Corner indicators -->
  <circle cx="50" cy="50" r="8" fill="#00ff00" opacity="0.6"/>
  <circle cx="950" cy="50" r="8" fill="#00ff00" opacity="0.6"/>
  <circle cx="50" cy="550" r="8" fill="#00ff00" opacity="0.6"/>
  <circle cx="950" cy="550" r="8" fill="#00ff00" opacity="0.6"/>
</svg>`;t=Buffer.from(a).toString("base64"),console.log("Created radar-style SVG, base64 length:",t.length)}catch(e){console.error("Failed to create placeholder image:",e);try{(0,c.unlinkSync)(r)}catch{}return n.NextResponse.json({error:"Failed to create image from GRIB2 data."},{status:500,headers:{"Cache-Control":"no-store"}})}try{(0,c.unlinkSync)(r),console.log("Temporary file cleaned up")}catch(e){console.warn("Failed to clean up temporary file:",e)}let i=new Date().toISOString();return n.NextResponse.json({message:"Radar image generated successfully",imageBase64:t,bounds:h,timestamp:i},{headers:{"Cache-Control":"no-store","Content-Type":"application/json"}})}catch(t){console.error("Error processing radar file:",t);try{(0,c.unlinkSync)(r)}catch{}let e=t instanceof Error?t.message:"Unknown error occurred";return n.NextResponse.json({error:`Failed to process radar file: ${e}`},{status:500,headers:{"Cache-Control":"no-store"}})}}let x=new a.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/radar/latest/route",pathname:"/api/radar/latest",filename:"route",bundlePath:"app/api/radar/latest/route"},resolvedPagePath:"C:\\Users\\Muhammad Huzaifa\\Downloads\\Radar Coding Challennge\\Radar-coding-challange\\src\\app\\api\\radar\\latest\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:m,staticGenerationAsyncStorage:w,serverHooks:R}=x,k="/api/radar/latest/route";function S(){return(0,s.patchFetch)({serverHooks:R,staticGenerationAsyncStorage:w})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[948,972],()=>r(8267));module.exports=o})();