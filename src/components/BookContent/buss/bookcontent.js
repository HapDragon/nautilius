/**
 * Created by wqy
 * Date 2022/12/21 10:48
 * Description
 */

import {MotionType, routePoints_C} from '../../../assets/pointlines'
import cesiumviewer from "../../../buss/cesiumviewer";

import {CreateCircleWaveMaterial, CreateGlowMaterial} from '../../../buss/UsefulMaterial'
import * as Cesium from 'cesium/Build/Cesium';

const keymapdata=new Map();

function haskey(key) {
    return keymapdata.has(key);
}
function getkey(key) {
    return keymapdata.get(key);
}
function setkey(key,mapdata) {
    keymapdata.set(key,mapdata);
}

function drawpoi(lon,lat) {
    const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
    const scene = viewer.scene;
    if (viewer == null) return;

    var center = Cesium.Cartesian3.fromDegrees(lon,lat);
    const prim=scene.primitives.add(new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.EllipseGeometry({
                center: center,
                semiMinorAxis: 100000.0,
                semiMajorAxis: 100000.0,//椭圆大小
            }),
        }),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: true,
            material: CreateCircleWaveMaterial()
        }),
    }));
    const entity=cesiumviewer.CesiumViewer.getInstance().SetEntity({
        id: "bookcontentpoi"+Cesium.createGuid(),
        position: center,
        billboard: {
            image: '/images/locmark.svg',
            width: 40, height: 40,
            // scale: 60,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        }
    })
    const boundingsphere=new Cesium.BoundingSphere(
        center,
        1200000
    );
    return {
        prim:prim,
        entity:entity,
        boundingsphere:boundingsphere
    }
}

function drawline(degreesarray) {
    const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
    const scene = viewer.scene;
    if (viewer == null) return;


    var cartesian3pois=Cesium.Cartesian3.fromDegreesArray(degreesarray);
    const prim=scene.primitives.add(new Cesium.GroundPolylinePrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.GroundPolylineGeometry({
                positions: cartesian3pois,
                width: 26.0
            }),
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
            //glowmaterial of routeline
            material: CreateGlowMaterial(new Cesium.Cartesian3(0.9, 0.2, 0.2), new Cesium.Cartesian3(0.5, 0.4, 0.7))
        })
    }));
    const boundingsphere=Cesium.BoundingSphere.fromPoints(cartesian3pois);
    return {
        prim:prim,
        boundingsphere:boundingsphere
    }

}

function setmapdatashow(mapdata,show) {
    if(mapdata==undefined) return;
    if(mapdata.entity){
        mapdata.entity.show=show;
    }
    if(mapdata.prim){
        mapdata.prim.show=show;
    }
}
function locatemapdata(mapdata) {
    if(mapdata==undefined||mapdata.boundingsphere==undefined) return;

    const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
    const scene = viewer.scene;
    if (viewer == null) return;

    scene.camera.flyToBoundingSphere(mapdata.boundingsphere);
}
function locatemapdatas(mapdatas) {
    const boundingspheres=mapdatas.map(item=>{return item.boundingsphere;});

    const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
    const scene = viewer.scene;
    if (viewer == null) return;

    scene.camera.flyToBoundingSphere(Cesium.BoundingSphere.fromBoundingSpheres(boundingspheres));
}

export function onToggleBookChapterShow(index,subindex,show,loc=true) {
    if(index==undefined||subindex==undefined) return;
    const key=`${index+1}-${subindex+1}`;
    if(haskey(key)===false){
        const routepois = routePoints_C.filter(item => item.bookchapter && item.bookchapter.find(subitem=>subitem==key) !=undefined);
        if(routepois.length<=0) return;
        if(routepois.length==1){
            const poisetting=drawpoi(routepois[0].position[0], routepois[0].position[1]);
            setkey(key,poisetting);
        }
        else{
            const degarray = [];
            routepois.forEach(item => {
                degarray.push(item.position[0]);
                degarray.push(item.position[1]);
            });
            const linesetting=drawline(degarray);

            setkey(key,linesetting);
        }
    }
    const mapdata=getkey(key);
    setmapdatashow(mapdata,show);
    if(show===true&&loc===true){
        locatemapdata(mapdata);
    }
}

export function onToggleBookPartShow(index,show) {
    if(index==undefined) return;


    let maxsubindex=0;
    if(index==0){
        maxsubindex=23;
    }
    else{
        maxsubindex=22;
    }

    const mapdatas=[];
    for(let i=0;i<=maxsubindex;i++){
        onToggleBookChapterShow(index,i,show,false);
        let key=`${index+1}-${i+1}`;
        if(haskey(key)){
            mapdatas.push(getkey(key));
        }

    }
    if(show===true){
        locatemapdatas(mapdatas);
    }



}