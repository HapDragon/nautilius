<!--
 * Created by wqy
 * Date 2022/11/28 16:04
 * Description definition of totalMap
-->
<script setup>
    import Compass from "./Compass/index.vue";
    import cesiumviewer from "../buss/cesiumviewer";
    // import * as Cesium from 'cesium/Build/Cesium';
    import coordinates from "../buss/Coordinates";

    import {routePoints_C, MotionType} from '../assets/pointlines'
    import {CreateGlowMaterial} from "../buss/UsefulMaterial";


    import SpaceMeasure from './SpaceMeasure/common/components/SpaceMeasure.vue'
    import ThematicMeasure from './ThematicMeasure/components/ThematicMeasure.vue'


    onMounted(() => {
        cesiumviewer.CesiumViewer.getInstance().Register('MainMap', {
            animation: false, //是否显示动画控件
            shouldAnimate: false,
            homeButton: false, //是否显示Home按钮
            fullscreenButton: false, //是否显示全屏按钮
            // baseLayerPicker: false, //是否显示图层选择控件
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
            // terrainProvider: Cesium.createWorldTerrain(
            //     {
            //         requestVertexNormals:true,
            //         requestWaterMask : true,
            //     }
            // ),
            // shadows: false,
        });


        DrawRoute();
        // DrawWorldOcean();



    })

    function DrawRoute() {
        const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
        const scene = viewer.scene;
        //draw total route line
        var linesettings = [];
        for (let i = 0; i < routePoints_C.length; i++) {
            let node = routePoints_C[i];
            if (node.motiontype != null) {
                if (linesettings.length > 0) {
                    linesettings[linesettings.length - 1].linearray = linesettings[linesettings.length - 1].linearray.concat(node.position)
                }
                linesettings.push({
                    motiontype: node.motiontype,
                    linearray: [],
                })
            }
            linesettings[linesettings.length - 1].linearray = linesettings[linesettings.length - 1].linearray.concat(node.position);

        }

        linesettings.forEach(item => {
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
                    material: item.motiontype == MotionType.Lincoln ? CreateGlowMaterial() :
                        item.motiontype == MotionType.Nautilius ? CreateGlowMaterial(new Cesium.Cartesian3(1, 1, 1), new Cesium.Cartesian3(0.7, 0.6, 0.9)) :
                            CreateGlowMaterial(new Cesium.Cartesian3(0.9, 0.5, 0.6), new Cesium.Cartesian3(0.5, 0.4, 0.7))
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
        var updatebillboardvisible = function () {
            let origin = scene.camera.position;
            let dir = new Cesium.Cartesian3();
            billboards._billboards.forEach(item => {
                Cesium.Cartesian3.subtract(item._position, origin, dir);
                let length = Cesium.Cartesian3.magnitude(dir);
                let ray = new Cesium.Ray(origin, dir);
                let intersct = Cesium.IntersectionTests.rayEllipsoid(ray, scene.globe.ellipsoid);
                if (intersct == null || intersct.start == null) {
                    item.show = false;
                    return;
                }
                item.show = Math.abs(intersct.start - length) < 100;
            })
        }
        scene.preUpdate.addEventListener(updatebillboardvisible);
    }

    function DrawWorldOcean() {
        const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
        const scene = viewer.scene;
        let worldRectangle = scene.primitives.add(new Cesium.GroundPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
                // geometry: new Cesium.RectangleGeometry({
                //     rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
                //     vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                //     height: -100,
                //     extrudedHeight: 10
                // })
                geometry:Cesium.RectangleGeometry.createShadowVolume(new Cesium.RectangleGeometry({
                        rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
                        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                        height: 0,
                        extrudedHeight: 10
                    }), function () {
                        return -10000
                    },
                    function () {
                        return 10000;
                    }),
            }),
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                material: new Cesium.Material({
                    fabric: {
                        // type: "Water",
                        uniforms: {
                            baseWaterColor: new Cesium.Color(64 / 255.0, 127 / 255.0, 253 / 255.0, 0.1),
                            blendColor: new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0, 0.1),
                            specularMap: '/images/cesium/earthspec1k.jpg',
                            normalMap: '/images/cesium/waterNormals.jpg',
                            frequency: 1000.0,
                            animationSpeed: 0.02,
                            amplitude: 10,
                            specularIntensity: 5,
                            fadeFactor: 1.0,
                        },
                        source: `
                        // Thanks for the contribution Jonas
// http://29a.ch/2012/7/19/webgl-terrain-rendering-water-fog

uniform sampler2D specularMap;
uniform sampler2D normalMap;
uniform vec4 baseWaterColor;
uniform vec4 blendColor;
uniform float frequency;
uniform float animationSpeed;
uniform float amplitude;
uniform float specularIntensity;
uniform float fadeFactor;

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);

    float time = czm_frameNumber * animationSpeed;

    // fade is a function of the distance from the fragment and the frequency of the waves
    float fade = max(1.0, (length(materialInput.positionToEyeEC) / 1000000.0) * frequency * fadeFactor);

    float specularMapValue = texture2D(specularMap, materialInput.st).r;

    // note: not using directional motion at this time, just set the angle to 0.0;
    vec4 noise = czm_getWaterNoise(normalMap, materialInput.st * frequency, time, 0.0);
    vec3 normalTangentSpace = noise.xyz * vec3(1.0, 1.0, (1.0 / amplitude));

    // fade out the normal perturbation as we move further from the water surface
    normalTangentSpace.xy /= fade;

    // attempt to fade out the normal perturbation as we approach non water areas (low specular map value)
    normalTangentSpace = mix(vec3(0.0, 0.0, 50.0), normalTangentSpace, specularMapValue);

    normalTangentSpace = normalize(normalTangentSpace);

    // get ratios for alignment of the new normal vector with a vector perpendicular to the tangent plane
    float tsPerturbationRatio = clamp(dot(normalTangentSpace, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);

    // fade out water effect as specular map value decreases
    material.alpha = mix(blendColor.a, baseWaterColor.a, specularMapValue) * specularMapValue;


    // base color is a blend of the water and non-water color based on the value from the specular map
    // may need a uniform blend factor to better control this
    material.diffuse = mix(blendColor.rgb, baseWaterColor.rgb, specularMapValue);

    // diffuse highlights are based on how perturbed the normal is
    material.diffuse += (0.1 * tsPerturbationRatio);

    material.diffuse = material.diffuse;

    material.normal = normalize(materialInput.tangentToEyeMatrix * normalTangentSpace);

    material.specular = specularIntensity;
    material.shininess = 10.0;

    return material;
}

                        `
                    },
                }),
                aboveGround: true,
            }),
            show: true,
            // debugShowBoundingVolume:true,
            debugShowShadowVolume: true,
        }));

    }


</script>
<template>
    <div id="MainMap" class="containerHole"></div>
    <compass></compass>
    <SpaceMeasure></SpaceMeasure>
    <ThematicMeasure></ThematicMeasure>

</template>


<style scoped>

</style>