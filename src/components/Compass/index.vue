<script setup>

	import Bus from '../../buss/Bus'
	import cesiumviewer from "../../buss/cesiumviewer";
	// import commonfuncs from '@/utils/cesium/commonfuncs'
	import coordinates from '../../buss/Coordinates';
	import * as Cesium from 'cesium/Build/Cesium';


	const northtin = ref(null);

	function onviewerloaded(viewer){
		if(viewer==undefined) return;
		viewer.scene.postRender.addEventListener(function () {
			let scenemode = viewer.scene.mode;
			if (scenemode == 3 || scenemode == 1) {
				let headingdeg = Cesium.Math.toDegrees(viewer.camera.heading);
				if(northtin.value==undefined) return;
				northtin.value.style.transform = "rotate(" + headingdeg + "deg)";
			}
		})
	}

	onMounted(() => {
		var viewer=cesiumviewer.CesiumViewer.getInstance().viewer;
		onviewerloaded(viewer);

		Bus.VM.$on(Bus.SignalType.Scene_Init_Finish,function (viewer) {
			onviewerloaded(viewer);

		})
	});
	//指北
	function northClick() {
		let camera = cesiumviewer.CesiumViewer.getInstance().GetCamera();
		let wgs84poi = new coordinates.CoordinateWGS84(camera.longitude, camera.latitude, camera.height);
		let wgs84poinew = cesiumviewer.CesiumViewer.getInstance().GetPointOnSameCircle(wgs84poi, camera.heading, 0, camera.pitch);

		cesiumviewer.CesiumViewer.getInstance().FlyToWithDuration(wgs84poinew.latitude, wgs84poinew.longitude, camera.height, 0, camera.pitch, camera.roll, -1);

	}

	//放大
	function zoomIn () {
		// window.Fyviewer.camera.zoomIn(5000);
		let Camera =cesiumviewer.CesiumViewer.getInstance().GetCamera();
		if (Camera.height < 100000) {
			cesiumviewer.CesiumViewer.getInstance().viewer.camera.zoomIn(800);
		}
		else if (Camera.height > 100000 && Camera.height < 300000) {
			cesiumviewer.CesiumViewer.getInstance().viewer.camera.zoomIn(8000);
		} else {
			cesiumviewer.CesiumViewer.getInstance().viewer.camera.zoomIn(50000);
		}
	}

	//缩小
	function zoomOut () {
		cesiumviewer.CesiumViewer.getInstance().viewer.camera.zoomOut(50000);
	}

	//全屏
	function fullscreenClick() {
		if (!document.fullscreenElement &&
			!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
			if (document.documentElement.requestFullscreen) {
				document.documentElement.requestFullscreen();
			} else if (document.documentElement.msRequestFullscreen) {
				document.documentElement.msRequestFullscreen();
			} else if (document.documentElement.mozRequestFullScreen) {
				document.documentElement.mozRequestFullScreen();
			} else if (document.documentElement.webkitRequestFullscreen) {
				document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		}

	}
</script>
<template>
	<div>
		<div class="position-absolute northinButton">
			<img src="./assets/compass.svg" class="position-absolute" style="right: 0px" />
			<img
				src="./assets/northin.svg"
				ref="northtin"
				class="position-absolute northArrow"

				@click="northClick"
			/>
		</div>

		<div class="position-absolute zoomInButton">
			<img src="./assets/zoomIn.svg" @click="zoomIn" />
		</div>

		<div class="position-absolute zoomOutButton">
			<img src="./assets/zoomOut.svg" @click="zoomOut" />
		</div>

		<div class="position-absolute fullscreenButton">
			<img src="./assets/fullscreen.svg" @click="fullscreenClick" />
		</div>
	</div>
</template>
<style lang="less" scoped>
	.northinButton {
		bottom: 196px;
		/*top:140px;*/
		right: 1vw;
		/*right:calc(24% + 48px);*/
		width: 34px;
		height: 34px;
		cursor: pointer;
		.northArrow {
			position: absolute;
			width: 34px;
			height: 34px;
			right: 0;
		}
	}

	.zoomInButton {
		bottom: 160px;
		right: 1vw;
		/*right:calc(24% + 48px);*/
	    /*top:176px;*/
		width: 34px;
		height: 34px;
		cursor: pointer;
	}

	.zoomOutButton {
		bottom: 124px;
		right: 1vw;
		/*right:calc(24% + 48px);*/
		/*top:212px;*/
		width: 34px;
		height: 34px;
		cursor: pointer;
	}

	.fullscreenButton {
		bottom: 88px;
		right: 1vw;
		/*right:calc(24% + 48px);*/
		/*top:248px;*/
		width: 34px;
		height: 34px;
		cursor: pointer;
	}
</style>
