
import 'cesium/Build/Cesium/Widgets/widgets.css';
import * as Cesium from 'cesium/Build/Cesium';

import Bus from "./Bus.js";
import coordinates from "./Coordinates";


class CesiumViewer {
	static getInstance() {
		if (!this.instance) {
			this.instance = new CesiumViewer();
		}
		return this.instance;
	}


	constructor() {
		this.instance = null;
		this.viewer = null;
		this.viewerlist = [];
		}


	Register(id,options) {
		let that = this;
		Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNDliOGIxOC1lYjcwLTQxZTgtOGNkYi0zNTJlNDI0NTJiYTAiLCJpZCI6NzY2OCwiaWF0IjoxNjcxNTg5MTIxfQ.VrZATj5uJgQGvSY66Tau_18_Zud_KWpTFwMDEti67iA'

		this.viewer = new Cesium.Viewer(id, options);

		// var GridImagery = new Cesium.GridImageryProvider();
		var imageryLayers = this.viewer.imageryLayers;
		// 		// var GridImageryLayer = imageryLayers.addImageryProvider(GridImagery); // 添加网格图层
		// 		// imageryLayers.raiseToTop(GridImageryLayer); // 将网格图层置顶
		// 		// var tilecoordinates = new Cesium.TileCoordinatesImageryProvider();
		// 		// var tilecoordinatesLayer = this.viewer.imageryLayers.addImageryProvider(tilecoordinates);
		// 		// imageryLayers.raiseToTop(tilecoordinatesLayer);

		imageryLayers.addImageryProvider(new Cesium.MapboxStyleImageryProvider({
			// styleId: 'streets-v12',
			// styleId: 'light-v11',
			// styleId: 'dark-v11',
			styleId: 'satellite-streets-v12',
			// styleId: 'navigation-night-v1',
			accessToken: 'pk.eyJ1Ijoid2FuZ3FpdXlhbiIsImEiOiJjbGJ2bTRhOTQwNTl4M25wcTgwcDZpZ3RzIn0.oiUc1hCNxVEVJbgKKKfRRQ'
		}));

		Bus.VM.$emit(Bus.SignalType.Scene_Init_Finish,that.viewer);




		this.viewer.selectedImageryProviderViewModel = null;
		this.viewer.scene.globe.depthTestAgainstTerrain = true;


		//将注册商标隐藏
		this.viewer._cesiumWidget._creditContainer.style.display = "none";

		let leftclickpos=[];

		//左键双击事件触发
		this.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
			Bus.VM.$emit(Bus.SignalType.Scene_Left_Double_Click, movement);
			leftclickpos=[];
		}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
		//鼠标移动事件触发
		this.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
			Bus.VM.$emit(Bus.SignalType.Scene_Mouse_Move, movement);
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		//鼠标中键滚轮事件触发
		this.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
			Bus.VM.$emit(Bus.SignalType.Scene_Mouse_Wheel, movement);
		}, Cesium.ScreenSpaceEventType.WHEEL);
		//鼠标右键单击事件触发
		this.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
			Bus.VM.$emit(Bus.SignalType.Scene_Mouse_Right_Click, movement);
			console.log(leftclickpos);
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
		//鼠标左键单击事件触发
		this.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
			Bus.VM.$emit(Bus.SignalType.Scene_Mouse_Left_Click, movement);
			// heading: 358.68414302229564
			// height: 20272.14625407043
			// latitude: 40.62940757457349
			// longitude: 111.63909861765495
			// pitch: -43.35476663990116
			// roll: 359.99797263830555

			var pos = that.GetPickedRayPositionWGS84(movement.position);
			if (!pos) return;
			leftclickpos.push(pos.longitude);
			leftclickpos.push(pos.latitude);

			console.log(pos);
			// var camerasetting=that.GetCamera();
			// console.log(camerasetting);
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		//通过控制高度


		this.viewerlist.push({
			viewer: this.viewer,
			id: id,
		});
	}









	ZoomTo(target, offset, viewercontainerid, callback) {
		let viewer = this.GetViewerByContainerid(viewercontainerid);
		if (viewer) {
			viewer.zoomTo(target, offset).then(function () {
				if (callback) {
					callback();
				}
			});
		}
	}



	//heading\pitch都为角度，roll目前全部传参为0
	CameraGoTo(latitude, longitude, height, heading, pitch, roll) {
		// camera set to a position with an orientation using heading, pitch and roll.
		this.viewer.scene.camera.setView({
			destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
			orientation: {
				heading: Cesium.Math.toRadians(heading),
				pitch: Cesium.Math.toRadians(pitch),
				roll: Cesium.Math.toRadians(roll),
			},
		});
	}

	//获取圆上另一个点
	//第一个参数wgs84poi表示圆上已知点，第二个参数heading表示第一个参数对应的heading，第三个参数表示新点的heading，第四个参数表示原始点和返回点的倾斜角（相同）
	//返回新点的wgs84poi经纬度坐标
	GetPointOnSameCircle(wgs84poi, heading, headingnew, pitch) {
		// heading=heading+180;
		// headingnew=headingnew+180;
		heading = 270 - heading;
		headingnew = 270 - headingnew;
		var planedis = wgs84poi.height / Math.tan(Cesium.Math.toRadians(0 - pitch));
		var mercatorpoi = coordinates.CoordinateMercator.fromWGS84(wgs84poi);
		// var x1=mercatorpoi.Mercator_X-planedis*Math.sin(Cesium.Math.toRadians(heading))+planedis*Math.sin(Cesium.Math.toRadians(headingnew));
		// var y1=mercatorpoi.Mercator_Y-planedis*Math.cos(Cesium.Math.toRadians(heading))+planedis*Math.cos(Cesium.Math.toRadians(headingnew));
		var x1 =
			mercatorpoi.Mercator_X -
			planedis * Math.cos(Cesium.Math.toRadians(heading)) +
			planedis * Math.cos(Cesium.Math.toRadians(headingnew));
		var y1 =
			mercatorpoi.Mercator_Y -
			planedis * Math.sin(Cesium.Math.toRadians(heading)) +
			planedis * Math.sin(Cesium.Math.toRadians(headingnew));
		return coordinates.CoordinateWGS84.fromMercatorxyh(x1, y1, wgs84poi.height);
	}

	//heading\pitch都为角度，roll目前全部传参为0 duration单位为秒
	FlyToWithDuration(latitude, longitude, height, heading, pitch, roll, duration, viewerContainerId) {
		if (viewerContainerId) {
			this.viewer = this.GetViewerByContainerid(viewerContainerId);
		}
		if (duration === -1) {
			this.viewer.camera.flyTo({
				destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
				orientation: {
					heading: Cesium.Math.toRadians(heading),
					pitch: Cesium.Math.toRadians(pitch),
					roll: Cesium.Math.toRadians(roll),
				},
				maximumHeight: 10,
				// maximumHeight:10,
				// pitchAdjustHeight:10,
				//easingFunction : Cesium.EasingFunction.BACK_IN_OUT
			});
		}
		this.viewer.camera.flyTo({
			destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
			orientation: {
				heading: Cesium.Math.toRadians(heading),
				pitch: Cesium.Math.toRadians(pitch),
				roll: Cesium.Math.toRadians(roll),
			},
			duraion: duration,
		});
	}

	FlyToRectangleWithDuration(longitude_west, latitude_south, longitude_east, latitude_north, duration) {
		if (duration == -1)
			this.viewer.camera.flyTo({
				destination: Cesium.Rectangle.fromDegrees(longitude_west, latitude_south, longitude_east, latitude_north),
			});
		else {
			this.viewer.camera.flyTo({
				destination: Cesium.Rectangle.fromDegrees(longitude_west, latitude_south, longitude_east, latitude_north, duration),
			});
		}
	}

	GetSceneMode() {
		return this.viewer.scene.mode;
	}

	GetCamera() {
		var ellipsoid = this.viewer.scene.globe.ellipsoid;
		var cartesian3 = this.viewer.camera.position;
		var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
		var lat = Cesium.Math.toDegrees(cartographic.latitude);
		var lng = Cesium.Math.toDegrees(cartographic.longitude);
		var alt = cartographic.height;
		return {
			longitude: lng,
			latitude: lat,
			height: alt,
			heading: Cesium.Math.toDegrees(this.viewer.camera.heading),
			pitch: Cesium.Math.toDegrees(this.viewer.camera.pitch),
			roll: Cesium.Math.toDegrees(this.viewer.camera.roll),
		};
	}

	Zoomin(val) {
		this.viewer.camera.zoomIn(val);
	}

	Zoomout(val) {
		this.viewer.camera.zoomOut(val);
	}

	GetPickedEllipsoidPositionWGS84(pos) {
		var cartesian = this.viewer.camera.pickEllipsoid(pos, this.viewer.scene.globe.ellipsoid);
		if (cartesian) {
			var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
			var longitude = Cesium.Math.toDegrees(cartographic.longitude);
			var latitude = Cesium.Math.toDegrees(cartographic.latitude);
			var height = cartographic.height;
			return new coordinates.CoordinateWGS84(longitude, latitude, height);
		}
		return null;
	}

	GetPickedFeature(pos) {
		// Pick a new feature
		var pickedFeature = this.viewer.scene.pick(pos);
		if (!Cesium.defined(pickedFeature)) return null;
		return pickedFeature;
	}

	Pickdrill(windowpos, width, height) {
		var pickedObjects = this.viewer.scene.drillPick(windowpos, 100000, width, height);
		pickedObjects.forEach((item) => {
			var style = item.primitive.style;
			style.readyPromise.then(function (style) {
				style.pointSize = 4;
				item.primitive.style = style;
			});
		});
		var ttt = 0;
	}

	GetPickedRayPositionWGS84(pos) {
		var ray = this.viewer.camera.getPickRay(pos);
		var x = Cesium.Math.toDegrees(ray.direction.x);
		var y = Cesium.Math.toDegrees(ray.direction.y);
		var z = Cesium.Math.toDegrees(ray.direction.z);
		var position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
		//var position = this.viewer.camera.pickEllipsoid(pos, this.viewer.scene.globe.ellipsoid);
		var feature = this.viewer.scene.pick(pos);
		if (!feature || feature === null) {
			if (Cesium.defined(position)) {
				return coordinates.CoordinateWGS84.fromCatesian(position);
			}
		} else {
			var cartesian = this.viewer.scene.pickPosition(pos);
			if (Cesium.defined(cartesian)) {
				return coordinates.CoordinateWGS84.fromCatesianWithCartographic(cartesian);
			}
		}
		return null;
	}

	GetNowRayPositionWGS84() {
		return this.GetPickedRayPositionWGS84(
			new Cesium.Cartesian2(
				document.getElementsByClassName("cesium-viewer")[0].clientWidth / 2,
				document.getElementsByClassName("cesium-viewer")[0].clientHeight / 2,
			),
		);
	}

	AddEntity(entity) {
		this.viewer.entities.add(entity);
	}

	//移除viewer中entityid包含指定id的实体对象
	RemoveEntities(containentityid) {
		let removeentityids = [];
		this.viewer.entities.values.forEach((entity) => {
			if (entity.id.indexOf(containentityid) != -1) removeentityids.push(entity.id);
		});
		removeentityids.forEach((eid) => {
			this.viewer.entities.removeById(eid);
		});
	}

	GetEntitysByContainId(containentityid, viewercontainerid) {
		let viewer = this.GetViewerByContainerid(viewercontainerid);
		let result = [];
		viewer.entities.values.forEach((entity) => {
			if (entity.id.indexOf(containentityid) != -1) result.push(entity);
		});
		return result;
	}

	HasEntityByIdPre(containentityid) {
		let flag = false;
		for (let i = 0; i < this.viewer.entities.values.length; i++) {
			if (this.viewer.entities.values[i].id.indexOf(containentityid) != -1) {
				flag = true;
				break;
			}
		}
		return flag;
	}

	RemoveEntityById(entityid) {
		this.viewer.entities.removeById(entityid);
	}

	SetEntity(entity) {
		var entityori = this.viewer.entities.getById(entity.id);
		if (entityori) {
			this.viewer.entities.remove(entityori);
		}
		//this.viewer.entities.values.unshift(entity);
		return this.viewer.entities.add(entity);
	}

	GetEntityById(entityid) {
		return this.viewer.entities.getById(entityid);
	}

	// 批量设置entity显示或隐藏
	SetEntitiesShow(entityId, flag) {
		let filterEntities = this.viewer.entities.values.filter((item) => item.id.includes(entityId));
		filterEntities.forEach((entity) => (entity.show = flag));
	}

	AddWMSImageryProvider(url, layername) {
		var result = this.viewer.scene.globe.imageryLayers.addImageryProvider(
			new Cesium.WebMapServiceImageryProvider({
				//加载一个新的图层
				url: url,
				layers: layername,
				parameters: {
					service: "WMS",
					format: "image/png",
					transparent: true,
				},
			}),
		);
		return result;
	}

	RmoveWMSImageryProvider(imagerylayer) {
		this.viewer.scene.globe.imageryLayers.remove(imagerylayer);
	}

	AddPrimitive(primitive, viewercontainerid) {
		if (viewercontainerid) {
			var thistimeviewer = this.GetViewerByContainerid(viewercontainerid);
			if (thistimeviewer) {
				return thistimeviewer.scene.primitives.add(primitive);
			}
			return null;
		} else {
			return this.viewer.scene.primitives.add(primitive);
		}
	}

	RemovePrimitive(primitive) {
		this.viewer.scene.primitives.remove(primitive);
	}

	GetWindowPosFromCartesian(cartesian) {
		return Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, cartesian);
	}

	GetWindowPosFromWGS84(wgs84pos) {
		return this.GetWindowPosFromCartesian(Cesium.Cartesian3.fromDegrees(wgs84pos.longitude, wgs84pos.latitude, wgs84pos.height));
	}

	GetLerpWGS84(wgs84pos1, wgs84pos2, tpoint) {
		var cartesian1 = Cesium.Cartesian3.fromDegrees(wgs84pos1.longitude, wgs84pos1.latitude, wgs84pos1.height);
		var cartesian2 = Cesium.Cartesian3.fromDegrees(wgs84pos2.longitude, wgs84pos2.latitude, wgs84pos2.height);
		var cartesian3 = Cesium.Cartesian3.lerp(cartesian1, cartesian2, tpoint, new Object());
		var cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
		return new coordinates.CoordinateWGS84(
			Cesium.Math.toDegrees(cartographic.longitude),
			Cesium.Math.toDegrees(cartographic.latitude),
			cartographic.height,
		);
	}

	AddPostRenderEventListener(func) {
		this.viewer.scene.postRender.addEventListener(func);
	}

	RemovePostRenderEventListener(func) {
		this.viewer.scene.postRender.removeEventListener(func);
	}

	getdeminterationPoint(cartesian3_poi, cartesian3_dir) {
		var ray = new Cesium.Ray(cartesian3_poi, cartesian3_dir);
		var interation = this.viewer.scene.globe.pick(ray, this.viewer.scene);
		if (Cesium.defined(interation)) {
			var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(interation);
			return new coordinates.CoordinateWGS84(
				Cesium.Math.toDegrees(cartographic.longitude),
				Cesium.Math.toDegrees(cartographic.latitude),
				cartographic.height,
			);
			// return{
			//     Latitude:Cesium.Math.toDegrees(cartographic.latitude),
			//     Longitude:Cesium.Math.toDegrees(cartographic.longitude),
			//     Altitude:cartographic.height
			// }
		} else return null;
	}

	GetNowDEMInterationPoint() {
		var cartesian3_poi = this.viewer.camera.position;
		var cartesian3_dir = this.viewer.camera.direction;
		return this.getdeminterationPoint(cartesian3_poi, cartesian3_dir);
	}

	GetCartesianFromWindowpos(x, y) {
		return this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(new Cesium.Cartesian2(x, y)), this.viewer.scene);
	}

	//像素坐标转地理坐标
	GetGeoCSFromWindowpos(movement, id) {
		if (id) {
			this.viewer = this.GetViewerByContainerid(id);
		}
		let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(movement.position), this.viewer.scene);
		let cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
		let lat = Cesium.Math.toDegrees(cartographic.latitude);
		let lng = Cesium.Math.toDegrees(cartographic.longitude);
		let alt = cartographic.height;
		return { lat: lat, lng: lng, alt: alt };
	}

	// 根据地形计算高度
	calcAltByTerrain(pois, call) {
		let centerPoints = [];
		pois.forEach((item) => {
			let cartesian = Cesium.Cartesian3.fromDegrees(item.lon, item.lat);
			let cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
			centerPoints.push(cartographic);
		});

		let promise = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, centerPoints);
		Cesium.when(promise, function (updatedPositions) {
			updatedPositions.forEach((point, index) => {
				pois[index].alt = point.height;
			});
			if (typeof call == "function") {
				call(pois);
			}
		});
	}

	// 设置地形图层
	setTerrainProvider(provider, viewercontainerid) {
		if (provider) {
			let viewer = this.GetViewerByContainerid(viewercontainerid);
			viewer.terrainProvider = provider;
		}
	}

	// 复位地形图层
	resetTerrainProvider(viewercontainerid) {
		let viewer = this.GetViewerByContainerid(viewercontainerid);
		viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
	}

	adjustTilesetHeight(tileset, heightOffset) {
		let boundingSphere = tileset.boundingSphere;
		let cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);

		let height = tileset.height || cartographic.height;
		let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
		let offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height + heightOffset);
		let translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
		tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
		return cartographic.height;
	}

	setHome(query) {
		query.heading = query.heading || 0;
		query.pitch = query.pitch || -45;
		query.range = query.range || 1000;

		if (query.x && query.y) {
			let that = this;
			let entityID = "home-point";
			this.calcAltByTerrain([{ lon: query.x, lat: query.y }], (results) => {
				let home = Cesium.Cartesian3.fromDegrees(results[0].lon, results[0].lat, results[0].alt);
				let hpr = new Cesium.HeadingPitchRange(
					Cesium.Math.toRadians(query.heading),
					Cesium.Math.toRadians(query.pitch),
					query.range,
				);
				let point = that.SetEntity({
					id: entityID,
					position: home,
					point: {
						pixelSize: 10,
					},
				});
				let local=new coordinates.CoordinateLocal(0,-1000/1.414,1000/1.414);
				let cartesian0=Cesium.Cartesian3.fromDegrees(results[0].lon, results[0].lat+0.0014, results[0].alt);
				let newcartesian=coordinates.CoordinateLocal.ToCartesian(local,cartesian0);
				that.viewer.scene.camera.setView({
					destination: newcartesian,
					orientation: {
						heading: Cesium.Math.toRadians(0),
						pitch: Cesium.Math.toRadians(-45),
						roll: Cesium.Math.toRadians(0),
					},
				});

				that.RemoveEntityById(entityID);
				// that.ZoomTo(point, hpr, null, () => {
				// 	that.RemoveEntityById(entityID);
				// });
			});
		} else {
			throw "无法定位初始位置，缺少x,y参数";
		}
	}
}

export default {
	CesiumViewer,
	// Cesium
}
