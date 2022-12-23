<template>
    <div class="tag" v-show="isShow" ref="popup">
        <div class="arrow">
            <!--<em></em>-->
            <span></span>
        </div>
        <div class="FontSize-14px">
            <div class="color-white" style="width:130px;margin:16px auto 8px auto;height:32px;">
                <div class="float-left">Longitude:</div>
                <div class="float-left margin-left12px">{{longitudestr}}</div>
            </div>
            <div class="color-white" style="width:130px;margin:8px auto;height:32px;">
                <div class="float-left">Latitude:</div>
                <div class="float-left margin-left12px">{{latitudestr}}</div>
            </div>
            <div class="color-white" style="width:130px;margin:8px auto;height:32px;position: relative;">
                <div class="float-left">Altitude:</div>
                <div class="float-left margin-left12px">{{altitudestr}}</div>

                <div style="position: absolute; right: -12px; top: 1px;" title="CopyText">
                    <img :src="copyimgurl"
                         style="height: 18px; width: 18px; cursor: pointer"
                         @click="copyText"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>


    import cesiumUtil from '../../../../buss/cesiumviewer'

    export default {
        name: "GetLocation",
        data() {
            return {
                copyimgurl:new URL(`../../assets/copy.svg`, import.meta.url).href,
                isShow:false,
                wgs84poi: {
                    lng: 0,
                    lat: 0,
                    alt: 0,
                },
                CesiumPostRenderLister: null,//CesiumPostRender监听事件
            }
        },
        mounted() {
            let that = this;
            this.CesiumPostRenderLister = function () {
                that.refreshpopuplocation();
            };
        },

        computed: {
            lng() {
                return this.wgs84poi.longitude;
            },
            lat() {
                return this.wgs84poi.latitude;
            },
            altitude() {
                return this.wgs84poi.height;
            },
            longitudestr() {
                /*let abs = Math.abs(this.lng);
                let du = parseInt(abs);
                let fen = parseInt((abs - du) * 60);
                let miao = parseInt(abs * 3600 - du * 3600 - fen * 60);
                return du + "°" + fen + "′" + miao + "″" + (this.lng >= 0 ? " E" : " W");*/
                if(this.lng){
                    return this.lng.toFixed(6);
                }
                return '';
            },
            latitudestr() {
                /*let abs = Math.abs(this.lat);
                return parseInt(abs * 100) / 100 + "° " + (this.lat >= 0 ? "N" : "S");*/
                if(this.lat){
                    return this.lat.toFixed(6);
                }
                return '';
            },
            altitudestr() {
                return parseInt(this.altitude * 100) / 100 + "米";
            }
        },
        methods: {
            setresult(wgs84pos) {
                this.wgs84poi = wgs84pos;
                this.refreshpopuplocation();
            },
            refreshpopuplocation() {
                //设置标签位置
                let posscreen = cesiumUtil.CesiumViewer.getInstance().GetWindowPosFromWGS84(this.wgs84poi);
                let popw = this.$refs.popup.offsetWidth;
                let poph = this.$refs.popup.offsetHeight;
                let xx = posscreen.x - popw + 110;
                let yy = posscreen.y - poph - 40;
                this.$refs.popup.style.left = xx + 'px';
                this.$refs.popup.style.top = yy + 'px';
            },
            copyText(){
                let tag = document.createElement('input');
                tag.setAttribute('id', 'cp_location_input');
                tag.value = 'x:'+this.longitudestr+' y:'+this.latitudestr+' z:'+parseInt(this.altitude * 100) / 100;
                document.getElementsByTagName('body')[0].appendChild(tag);
                document.getElementById('cp_location_input').select();
                document.execCommand('copy');
                document.getElementById('cp_location_input').remove();

            },
        },
        watch: {
            isShow(newval, oldval) {
                if (newval) {
                    cesiumUtil.CesiumViewer.getInstance().AddPostRenderEventListener(this.CesiumPostRenderLister);
                }
                else {
                    cesiumUtil.CesiumViewer.getInstance().RemovePostRenderEventListener(this.CesiumPostRenderLister);
                }
            }
        },
    }
</script>

<style scoped>
    .tag {
        width: 180px;
        height: 150px;
        left: 300px;
        top: 400px;
        border: none;
        border-radius: 4px;
        position: fixed;
        background-color: #091426e5;
    }

    .arrow {
        position: absolute;
        width: 40px;
        height: 40px;
        bottom: -40px;
        left: 100px;
    }

    .arrow * {
        display: block;
        border-width: 20px;
        position: absolute;
        border-style: solid dashed dashed dashed;
        font-size: 0;
        line-height: 0;
    }

    .arrow span {
        border-color: #091426e5 transparent transparent;
        top: -5px;
        left: -50px;
    }
</style>
