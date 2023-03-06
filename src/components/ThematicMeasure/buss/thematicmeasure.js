/**
 * Created by wqy
 * Date 2023/3/1 9:03
 * Description
 */
import cesiumviewer from "../../../buss/cesiumviewer";
import Bus from '../../../buss/Bus'
import Coordinates from "../../../buss/Coordinates";

function drawpoi(cartesian) {
    cesiumviewer.CesiumViewer.getInstance().SetEntity(new Cesium.Entity({
        id: depthmeasure.entitypre + "poi" + Cesium.createGuid(),
        position: cartesian,
        point: {
            pixelSize: 10,
            color: Cesium.Color.YELLOW,
            // scaleByDistance:new Cesium.NearFarScalar(0, 0, 1, 1),
            disableDepthTestDistance: 0
        }
    }));
}



function drawline(cartesians) {
    cesiumviewer.CesiumViewer.getInstance().SetEntity(new Cesium.Entity({
        id: depthmeasure.entitypre + "polyline0",
        polyline: {
            positions: cartesians,
            material: new Cesium.Color(0, 1, 0, 0.6),
            width: 2,
            clampToGround: true
            // depthFailMaterial:this.Color.ToCesiumColor()
        }
    }))
}

function computechartdata() {
    let viewer = cesiumviewer.CesiumViewer.getInstance().viewer;
    if (viewer == null) return;
    if (depthmeasure.poilist.length < 2) return;
    let provider = cesiumviewer.CesiumViewer.getInstance().depthimagery;
    if (provider == null) return;

    provider=provider._imageryProvider;
    let cartesianlist = depthmeasure.poilist;
    let totalnum = depthmeasure.intervalnum;
    const scene = viewer.scene;
    let promiseall = [];
    let dislensettings=Coordinates.GetDislen(cartesianlist);
    let readynum=0;
    Bus.VM.$emit(Bus.SignalType.STARTDRAWCHART);
    for (let i = 0; i <= totalnum; i++) {
        let cartesiansetting = Coordinates.GetCartesianByLerpWithDis(cartesianlist, i / totalnum,dislensettings);
        let cartesian = cartesiansetting.cartesian;
        let cartographic = scene.globe.ellipsoid.cartesianToCartographic(
            cartesian
        );

        let cartesian2 = new Cesium.Cartesian2();
        provider.tilingScheme.positionToTileXY(cartographic, depthmeasure.picklevel, cartesian2);
        let promise = provider.pickFeatures(cartesian2.x, cartesian2.y, depthmeasure.picklevel, cartographic.longitude, cartographic.latitude);
        var promisenew = new Promise(function (resolve, reject) {
            promise.then(function (res) {
                    // res.imageryLayer = provider;
                    // For features without a position, use the picked location.
                    if (!Cesium.defined(res.position)) {
                        res.position = cartographic;
                        res.dislen=cartesiansetting.dis
                        Bus.VM.$emit(Bus.SignalType.DRAWCHARTPROGRESS,(++readynum)/totalnum);
                    }
                    resolve(res)
                },
                err => {
                    reject();
                })
        });
        promiseall.push(promisenew);
    }
    Promise.all(promiseall).then(values => {
        // Number(values[0][0].data.substring(values[0][0].data.indexOf('Elevation value (m): ')+21,values[0][0].data.lastIndexOf('.  Derived from')))
        values.forEach(item => {
            if (item && item[0] && item[0].data) {
                let height = Number(item[0].data.substring(item[0].data.indexOf('Elevation value (m): ') + 21, item[0].data.lastIndexOf('.  Derived from')));
                item.position.height = height;
            }
        })

        let data=values.map(item=>{
            return {
                height:item.position.height,
                dis:item.dislen,
                lng:Cesium.Math.toDegrees(item.position.longitude),
                lat:Cesium.Math.toDegrees(item.position.latitude)
            }
        })
        for(let i=0;i<data.length;i++){
            data[i].id=i;
        }
        Bus.VM.$emit(Bus.SignalType.DRAWCHART,data);

        // debugger

    })
    // debugger;
}
const depthmeasure = {
    entitypre: "depthmeasure",
    poilist: [],
    intervalnum: 40,
    picklevel: 19,

}

function onDepthMeasureLeftClick(e) {
    let pos = cesiumviewer.CesiumViewer.getInstance().GetPickedRayPositionWGS84(e.position);
    if (!pos) return;

    let cartesian = pos.ToCartesian();
    depthmeasure.poilist.push(cartesian);
    drawpoi(cartesian);

}

function onDepthMeasureRightClick(e) {
    Bus.VM.$off(Bus.SignalType.Scene_Mouse_Left_Click, onDepthMeasureLeftClick);
    Bus.VM.$off(Bus.SignalType.Scene_Mouse_Move, onDepthMeasureMouseMove);
    onDepthMeasureLeftClick(e)
    const depthimagery = cesiumviewer.CesiumViewer.getInstance().depthimagery;
    if (depthimagery == null) return;
    if (depthmeasure.poilist.length < 2) return;
    computechartdata()
}

function onDepthMeasureMouseMove(e) {
    if (depthmeasure.poilist.length == 0) return;
    var pos = cesiumviewer.CesiumViewer.getInstance().GetPickedRayPositionWGS84(e.endPosition)
    if (pos == null) return;

    var cartesians = depthmeasure.poilist.slice();
    cartesians.push(pos.ToCartesian());
    drawline(cartesians);
}

function clearDepthMeasure() {
    Bus.VM.$off(Bus.SignalType.Scene_Mouse_Left_Click, onDepthMeasureLeftClick);
    Bus.VM.$off(Bus.SignalType.Scene_Mouse_Right_Click, onDepthMeasureRightClick);
    Bus.VM.$off(Bus.SignalType.Scene_Mouse_Move, onDepthMeasureMouseMove);
    cesiumviewer.CesiumViewer.getInstance().RemoveEntities(depthmeasure.entitypre);
    depthmeasure.poilist = [];
    Bus.VM.$emit(Bus.SignalType.CLOSECHART);
}

export function ToggleEnableDepthMeasure(enable) {
    if (enable === false) {
        clearDepthMeasure()
    } else {
        Bus.VM.$emit(Bus.SignalType.CLEARMEASURES);
        Bus.VM.$on(Bus.SignalType.Scene_Mouse_Left_Click, onDepthMeasureLeftClick);
        Bus.VM.$on(Bus.SignalType.Scene_Mouse_Right_Click, onDepthMeasureRightClick);
        Bus.VM.$on(Bus.SignalType.Scene_Mouse_Move, onDepthMeasureMouseMove);
    }

}
export function drawchartpoi(longitude,latitude) {
    cesiumviewer.CesiumViewer.getInstance().SetEntity(new Cesium.Entity({
        id: depthmeasure.entitypre + "drawchartpoi",
        position: Cesium.Cartesian3.fromDegrees(longitude,latitude),
        point: {
            pixelSize: 12,
            color: Cesium.Color.CORAL,
            // scaleByDistance:new Cesium.NearFarScalar(0, 0, 1, 1),
            disableDepthTestDistance: 0
        }
    }));
}

export function ClearDrawChartPoi() {
    cesiumviewer.CesiumViewer.getInstance().RemoveEntities(depthmeasure.entitypre+"drawchartpoi");
}