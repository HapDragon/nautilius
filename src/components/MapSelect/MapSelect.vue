<!--
 * Created by wqy
 * Date 2022/11/30 10:20
 * Description
-->
<template>
    <div id="MapSelect">
        <img v-for="(item,index) in MapList" :title="item.name"
             :src="item.show==true?item.visibleimgurl:item.invisibleimgurl"
             class="position-absolute"
             @click="item.onclick()"
             :style="`bottom:${300+index*40}px`"/>

    </div>
</template>

<script setup>
    import {ToggleLonLatMapShow,ToggleOceanCurrentShow,ToggleRainDropShow,ToggleTimeShow,ToggleDepthWMShow,ToggleOceanWaterShow,ToggleUnderSeaFeatureShow} from './buss/mapselect'
    const MapList=ref([
        {
            name:"longitude and latitude",
            show:false,
            visibleimgurl:new URL(`./assets/lonlatselected.svg`, import.meta.url).href,
            invisibleimgurl:new URL(`./assets/lonlat.svg`, import.meta.url).href,
            onclick:function () {
                this.show=!this.show;
                ToggleLonLatMapShow(this.show);

            }
        },
        {
            name:"Ocean Current",
            show:false,
            visibleimgurl:new URL(`./assets/oceancurrentselected.svg`, import.meta.url).href,
            invisibleimgurl:new URL(`./assets/oceancurrent.svg`, import.meta.url).href,
            onclick:function () {
                this.show=!this.show;
                ToggleOceanCurrentShow(this.show)
                // ToggleLonLatMapShow(this.show);

            }
        },
        {
            name:"Raindrop ripple",
            show:false,
            visibleimgurl:new URL(`./assets/Raindropripple_selected.jpg`, import.meta.url).href,
            invisibleimgurl:new URL(`./assets/Raindropripple.jpg`, import.meta.url).href,
            onclick:function () {
                this.show=!this.show;
                ToggleRainDropShow(this.show)
                // ToggleLonLatMapShow(this.show);

            }
        },
        {
            name:"Time of occurrence",
            show:false,
            visibleimgurl:new URL(`./assets/timeselected.svg`, import.meta.url).href,
            invisibleimgurl:new URL(`./assets/time.svg`, import.meta.url).href,
            onclick:function () {
                this.show=!this.show;
                ToggleTimeShow(this.show)
                // ToggleLonLatMapShow(this.show);

            }
        },
        {
            name:"Depth WMS",
            show:false,
            visibleimgurl:new URL(`./assets/depth_selected.jpg`, import.meta.url).href,
            invisibleimgurl:new URL(`./assets/depth.jpg`, import.meta.url).href,
            onclick:function () {
                this.show=!this.show;
                ToggleDepthWMShow(this.show)
                // ToggleLonLatMapShow(this.show);

            }
        },
        {
            name:"Ocean Water",
            show:false,
            visibleimgurl:new URL(`./assets/oceanwater_selected.jpg`, import.meta.url).href,
            invisibleimgurl:new URL(`./assets/oceanwater.jpg`, import.meta.url).href,
            onclick:function () {
                this.show=!this.show;
                ToggleOceanWaterShow(this.show)
                // ToggleLonLatMapShow(this.show);

            }
        },
        {
            name:"UnderseaFeature",
            show:false,
            visibleimgurl:new URL(`./assets/underseaname_selected.svg`, import.meta.url).href,
            invisibleimgurl:new URL(`./assets/underseaname.svg`, import.meta.url).href,
            onclick:function () {
                this.show=!this.show;
                ToggleUnderSeaFeatureShow(this.show)
                // ToggleLonLatMapShow(this.show);

            }
        },
    ])


</script>

<style lang="less" scoped>
img{
    right:1vw;
    bottom:300px;
    width:32px;height:32px;
}
</style>