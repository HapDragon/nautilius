<!--
 * Created by wqy
 * Date 2022/11/28 16:04
 * Description definition of totalMap
-->
<script setup>
    import Compass from "./Compass/index.vue";
    import cesiumviewer from "../buss/cesiumviewer";
    import * as Cesium from 'cesium/Build/Cesium';
    import coordinates from "../buss/Coordinates";

    import {routePoints_C,MotionType} from '../assets/pointlines'
    import {CreateGlowMaterial} from "../buss/UsefulMaterial";


    import SpaceMeasure from './SpaceMeasure/common/components/SpaceMeasure.vue'


    onMounted(() => {
        cesiumviewer.CesiumViewer.getInstance().Register('MainMap',{
            animation: false, //是否显示动画控件
            shouldAnimate: false,
            homeButton: false, //是否显示Home按钮
            fullscreenButton: false, //是否显示全屏按钮
            baseLayerPicker: false, //是否显示图层选择控件
            geocoder: false, //是否显示地名查找控件
            timeline: false, //是否显示时间线控件
            sceneModePicker: false, //是否显示投影方式控件
            navigationHelpButton: false, //是否显示帮助信息控件
            infoBox: false, //是否显示点击要素之后显示的信息
            requestRenderMode: false, //启用请求渲染模式
            scene3DOnly: false, //每个几何实例将只能以3D渲染以节省GPU内存
            sceneMode: 3, //初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  new Cesium.SceneMode
            fullscreenElement: document.body, //全屏时渲染的HTML元素 暂时没发现用处
            navigation: false, //是否显示导航罗盘控件
            shadows: true,
            // shadows: false,
        });




        DrawRoute();
        DrawOceanCurrent();
    })

    function DrawRoute() {
        const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
        const scene = viewer.scene;
        //draw total route line
        var linesettings=[];
        for(let i=0;i<routePoints_C.length;i++){
            let node=routePoints_C[i];
            if(node.motiontype!=null){
                if(linesettings.length>0){
                    linesettings[linesettings.length-1].linearray=linesettings[linesettings.length-1].linearray.concat(node.position)
                }
                linesettings.push({
                    motiontype:node.motiontype,
                    linearray:[],
                })
            }
            linesettings[linesettings.length-1].linearray=linesettings[linesettings.length-1].linearray.concat(node.position);

        }

        linesettings.forEach(item=>{
            const instance = new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                    positions: Cesium.Cartesian3.fromDegreesArray(item.linearray),
                    width: 18.0
                }),
            });

            scene.groundPrimitives.add(new Cesium.GroundPolylinePrimitive({
                geometryInstances: instance,
                appearance: new Cesium.PolylineMaterialAppearance({
                    //glowmaterial of routeline
                    material: item.motiontype==MotionType.Lincoln?CreateGlowMaterial():
                        item.motiontype==MotionType.Nautilius?CreateGlowMaterial(new Cesium.Cartesian3(1,1,1),new Cesium.Cartesian3(0.7,0.6,0.9)):
                            CreateGlowMaterial(new Cesium.Cartesian3(0.9,0.5,0.6),new Cesium.Cartesian3(0.5,0.4,0.7))
                })
            }));
        })



        //add special time data with billboardcollection
        const billboards = scene.primitives.add(new Cesium.BillboardCollection());
        // routePoints_C.forEach(
        //     item => {
        //         if (item.billboardimg != undefined) {
        //             billboards.add({
        //                 image : item.billboardimg,
        //                 width:24,
        //                 height:24,
        //                 verticalOrigin:Cesium.VerticalOrigin.BOTTOM,
        //                 heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND,
        //                 disableDepthTestDistance:Number.POSITIVE_INFINITY,
        //                 // eyeOffset:new Cesium.Cartesian3(1000,1000,1000),
        //                 position:Cesium.Cartesian3.fromDegrees(item.position[0],item.position[1],0)
        //             });
        //         }
        //     }
        // );


        //when billboards is in the backforward of the earth make it invisible
        var updatebillboardvisible=function(){
            let origin=scene.camera.position;
            let dir=new Cesium.Cartesian3();
            billboards._billboards.forEach(item=>{
                Cesium.Cartesian3.subtract(item._position,origin,dir);
                let length=Cesium.Cartesian3.magnitude(dir);
                let ray=new Cesium.Ray(origin,dir);
                let intersct=Cesium.IntersectionTests.rayEllipsoid(ray,scene.globe.ellipsoid);
                if(intersct==null||intersct.start==null) {
                    item.show=false;
                    return;
                }
                item.show=Math.abs(intersct.start-length)<100;
            })
        }
        scene.preUpdate.addEventListener(updatebillboardvisible);
    }

    function DrawOceanCurrent() {

    }


</script>
<template>
    <div id="MainMap" class="containerHole"></div>
    <compass></compass>
    <SpaceMeasure></SpaceMeasure>
</template>


<style scoped>

</style>