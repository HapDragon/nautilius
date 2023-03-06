/**
 * Created by wqy
 * Date 2022/11/30 13:11
 * Description
 */
import Bus from "../../../buss/Bus";
import cesiumviewer from "../../../buss/cesiumviewer";
import coordinate from '../../../buss/Coordinates'
// import * as Cesium from 'cesium/Build/Cesium';
import {oceanCurrentPoints_C, routePoints_C} from '../../../assets/pointlines'

import {CreateFlowMaterial, CreateFlowWithTextMaterial} from '../../../buss/UsefulMaterial'


import GlobeFS from "./GlobeFS.js";

let lonlatentitys = [];
let lonlatprim = null;

export function ToggleLonLatMapShow(visible) {
    const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
    if (viewer == undefined) return;

    const scene = viewer.scene;

    if (visible === true) {
        if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {//判断是否支持图像渲染像素化处理
            viewer.resolutionScale = window.devicePixelRatio;
        }
//开启抗锯齿
        viewer.scene.fxaa = true;
        viewer.scene.postProcessStages.fxaa.enabled = true;

        let lonlatlabel = [];

        for (let lang = -180; lang <= 180; lang += 20) {
            let text = "";
            if (lang === 0) {
                text = "0";
            }
            text += lang === 0 ? "" : "" + lang + "°";
            if (lang === -180) {
                text = "";
            } else if (lang < 0) {
                text = text.replace('-', '');
                text += "W";
            } else text += "E";

            lonlatlabel.push(
                {
                    degreearray: [[lang, -85], [lang, -75], [lang, -65], [lang, -55], [lang, -45], [lang, -35], [lang, -25], [lang, 5], [lang, 85], [lang, 75], [lang, 65], [lang, 55], [lang, 45], [lang, 35], [lang, 25], [lang, 15]],
                    text: text
                })

            lonlatentitys.push(viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lang, 0),
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArray([
                        lang,
                        -90,
                        lang,
                        0,
                        lang,
                        90,
                    ]),
                    width: 2.0,
                    material: Cesium.Color.WHITE,
                },
            }));
        }

        //纬度
        let langS = [];
        for (let lang = -180; lang <= 180; lang += 5) {
            langS.push(lang);
        } //每隔10读绘制一条纬度线和纬度标注

        for (let lat = -80; lat <= 80; lat += 10) {
            let text = "";
            text += "" + lat + "°";
            if (lat === 0) {
                text = "equator";
            } else if (lat < 0) {
                text = text.replace('-', '');
                text += "S";
            } else text += "N";

            lonlatlabel.push(
                {
                    degreearray: [],
                    text: text
                });
            for (let i = -180; i < 180; i += 5) {
                if (i % 5 == 0 && i % 10 != 0) {
                    lonlatlabel[lonlatlabel.length - 1].degreearray.push([i, lat]);
                }
            }
            lonlatentitys.push(
                viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(0, lat),
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArray(
                            langS
                                .map((long) => {
                                    return [long, lat].join(",");
                                })
                                .join(",")
                                .split(",")
                                .map((item) => Number(item))
                        ),
                        width: 2.0,
                        material: Cesium.Color.WHITE,
                    },
                }));
        }

        // Create a label collection with two labels

        lonlatprim = scene.primitives.add(new Cesium.LabelCollection());
        lonlatlabel.forEach(labelsetting => {
            labelsetting.degreearray.forEach(degarr => {
                lonlatprim.add({
                    position: Cesium.Cartesian3.fromDegrees(degarr[0], degarr[1]),
                    text: labelsetting.text,
                    font: "12px sans-serif",
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    fillColor: Cesium.Color.WHITE,
                })
            })
        })
        // labels.add({
        //     position : new Cesium.Cartesian3(1.0, 2.0, 3.0),
        //     text : 'A label'
        // });
        // labels.add({
        //     position : new Cesium.Cartesian3(4.0, 5.0, 6.0),
        //     text : 'Another label'
        // });

    } else {
        lonlatentitys.forEach(item => {
            viewer.entities.remove(item);
        })
        lonlatentitys = [];


        if (lonlatprim != null) {
            viewer.scene.primitives.remove(lonlatprim);
        }
    }
}

let oceancurrentprims = [];
let currenttextimghash = [];

function getCurrentNameText(text, color, fontsize) {
    let find = currenttextimghash.find(item => item.text == text);
    if (find == undefined) {
        var c = document.createElement("canvas");
        const d = (text + "").length * fontsize;
        c.width = d;
        c.height = fontsize;
        var ctx = c.getContext("2d");

        ctx.fillStyle = color;
        ctx.font = "bold " + fontsize + "px 微软雅黑"; //设置字体
        ctx.textBaseline = 'hanging'; //在绘制文本时使用的当前文本基线
        //绘制文本
        ctx.fillText(text, 0, 0);
        find = c;
        currenttextimghash.push({text: text, textimage: c})
        // let a = document.createElement('a');
        // a.download = "p1.png";
        // a.href = c.toDataURL("image/png");
        // a.click()

    }
    return find;
}

export function ToggleOceanCurrentShow(visible) {
    const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
    if (viewer == undefined) return;

    const scene = viewer.scene;

    if (visible === true) {
        if (oceancurrentprims.length > 0) {
            oceancurrentprims.forEach(prim => {
                prim.show = true;
            });
        } else {
            oceanCurrentPoints_C.forEach(oceancur => {
                oceancurrentprims.push(scene.primitives.add(new Cesium.GroundPolylinePrimitive({
                    geometryInstances: oceancur.linearray.map(degarr => {
                        return new Cesium.GeometryInstance({
                            geometry: new Cesium.GroundPolylineGeometry({
                                positions: Cesium.Cartesian3.fromDegreesArray(degarr),
                                width: 40,
                            }),
                        })
                    }),
                    // appearance: new Cesium.PolylineMaterialAppearance()
                    appearance: new Cesium.PolylineMaterialAppearance(
                        {
                            material: CreateFlowWithTextMaterial({
                                image: '/images/arrow.png',
                                // textimage:'/images/arrow.png',
                                textimage: getCurrentNameText(oceancur.name, oceancur.color == undefined ? '#DC143C' : oceancur.color, 12),
                                textbili: 0.5,
                                textlength: 300,
                                speed: 10,
                                repeatX: -40,
                                repeatY: 2,
                                needflipdir: oceancur.needflipdir,
                                color: oceancur.color == undefined ? undefined : Cesium.Color.fromCssColorString(oceancur.color)
                                // textyflip:oceancur.textyflip
                            })
                        }
                    ),
                })));
            })
        }
    } else {
        oceancurrentprims.forEach(prim => {
            prim.show = false;
            // scene.primitives.remove(prim);
        })

    }
}

export function ToggleRainDropShow(visible) {
    const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
    if (viewer == undefined) return;


    if (ToggleRainDropShow.originglobalfs == undefined || ToggleRainDropShow.rainglobalfs == undefined || ToggleRainDropShow.sourceindex == undefined) {
        let sourceIndex = viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources.findIndex(item => item.indexOf('vec4 sampleAndBlend(') >= 0);
        ToggleRainDropShow.originglobalfs = viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources[sourceIndex];
        ToggleRainDropShow.sourceindex = sourceIndex;

        let strindex = viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources[sourceIndex].indexOf('vec4 sampleAndBlend(');
        ToggleRainDropShow.rainglobalfs = ToggleRainDropShow.originglobalfs.substr(0, strindex) + GlobeFS + ToggleRainDropShow.originglobalfs.substr(strindex);
        ToggleRainDropShow.rainglobalfs = ToggleRainDropShow.rainglobalfs.replace('vec4 value = texture2D(textureToSample, textureCoordinates);\nvec3 color = value.rgb;\nfloat alpha = value.a;',
            'vec3 color=getrainsplitcolor(textureToSample,textureCoordinates); \nfloat alpha = textureAlpha;');

    }
    //it now can be activated immediately
    viewer.scene.globe._material = visible === false ? undefined : new Cesium.Material({
        fabric: {
            type: 'Color',
            uniforms: {
                color: new Cesium.Color(0.0, 0.0, 0.0, 0.0)
            }
        }
    });
    viewer.scene.globe._surfaceShaderSet.material = viewer.scene.globe._material;
    viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources[ToggleRainDropShow.sourceindex] = visible === true ? ToggleRainDropShow.rainglobalfs : ToggleRainDropShow.originglobalfs;

}

export function ToggleTimeShow(visible) {
    if (ToggleTimeShow.prim == undefined) {
        const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
        if (viewer == undefined) return;
        const scene = viewer.scene;

        ToggleTimeShow.prim = scene.primitives.add(new Cesium.LabelCollection());
        routePoints_C.forEach(
            item => {
                if (item.time != undefined) {
                    let time = new Date(item.time);
                    ToggleTimeShow.prim.add({
                        position: Cesium.Cartesian3.fromDegrees(item.position[0], item.position[1]),
                        font: '12px sans-serif',
                        showBackground: true,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        text: `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()} ${time.getHours()} o'clock`
                    });

                }
            }
        );
        //when billboards is in the backforward of the earth make it invisible
        var updatelabelvisible = function () {
            let origin = scene.camera.position;
            let dir = new Cesium.Cartesian3();
            ToggleTimeShow.prim._labels.forEach(item => {
                Cesium.Cartesian3.subtract(item._position, origin, dir);
                let length = Cesium.Cartesian3.magnitude(dir);
                let ray = new Cesium.Ray(origin, dir);
                let intersct = Cesium.IntersectionTests.rayEllipsoid(ray, scene.globe.ellipsoid);
                if (intersct == null || intersct.start == null) {
                    item.show = false;
                    return;
                }
                item.show = Math.abs(intersct.start - length) < 100 && ToggleTimeShow.prim.show;
            })
        }
        scene.preUpdate.addEventListener(updatelabelvisible);
    }
    ToggleTimeShow.prim.show = visible;

}


export function ToggleDepthWMShow(visible) {
    if (cesiumviewer.CesiumViewer.getInstance().depthimagery == null) return;

    cesiumviewer.CesiumViewer.getInstance().depthimagery.show = visible;
    if (visible === true) {
        viewer.imageryLayers.raiseToTop(cesiumviewer.CesiumViewer.getInstance().depthimagery);
    }
}

export function ToggleUnderSeaFeatureShow(visible) {
    if (cesiumviewer.CesiumViewer.getInstance().underseafeatureimagery == null) return;

    cesiumviewer.CesiumViewer.getInstance().underseafeatureimagery.show = visible;
    if (visible === true) {
        viewer.imageryLayers.raiseToTop(cesiumviewer.CesiumViewer.getInstance().underseafeatureimagery);
    }
}

export function ToggleOceanWaterShow(visible) {
    if (ToggleOceanWaterShow.waterprim == null) {
        const viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
        if (viewer == undefined) return;
        const scene=viewer.scene;
        ToggleOceanWaterShow.waterprim = scene.primitives.add(new Cesium.GroundPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.RectangleGeometry({
                    rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
                    vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                    height: 0,
                    // extrudedHeight: 1,
                    // shadowVolume: true,
                })
                // geometry: Cesium.RectangleGeometry.createShadowVolume(new Cesium.RectangleGeometry({
                //         rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
                //         vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                //         height: 0,
                //         // extrudedHeight: 10
                //     }), function () {
                //         return -10000
                //     },
                //     function () {
                //         return 10000;
                //     }),
            }),
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                // flat:true,
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
    ToggleOceanWaterShow.waterprim.show=visible;
}