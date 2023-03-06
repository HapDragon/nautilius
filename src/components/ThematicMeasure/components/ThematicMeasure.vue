<!--
 * Created by wqy
 * Date 2023/3/1 8:53
 * Description
-->
<template>
    <div id="ThematicMeasure">
        <img v-for="(item,index) in MeasureList" :title="item.name"
             :src="item.enable===true?item.visibleimgurl:item.invisibleimgurl"
             class="position-absolute"
             @click="item.onclick()"
             :style="`top:${300+index*40}px`"/>
        <drawchart></drawchart>


    </div>
</template>

<script setup>
    import {
        ToggleEnableDepthMeasure,
    } from "../buss/thematicmeasure";
    import drawchart from "./drawchart.vue";
    import Bus from '../../../buss/Bus'


    Bus.VM.$on(Bus.SignalType.CLEARTHEMATICMEASURES,function () {
        MeasureList.value.forEach(item=>{
            item.enable=true;
            item.onclick();
        })
    })

    const MeasureList=ref([
        {
            name:"MeasureDepth",
            enable:false,
            visibleimgurl:new URL(`../assets/depth_enabled.svg`, import.meta.url).href,
            invisibleimgurl:new URL(`../assets/depth.svg`, import.meta.url).href,
            onclick:function () {
                this.enable=!this.enable;
                ToggleEnableDepthMeasure(this.enable);
            }
        },



        // {
        //     name:"Depth WMS",
        //     show:false,
        //     visibleimgurl:new URL(`./assets/timeselected.svg`, import.meta.url).href,
        //     invisibleimgurl:new URL(`./assets/time.svg`, import.meta.url).href,
        //     onclick:function () {
        //         this.show=!this.show;
        //         ToggleDepthWMShow(this.show)
        //         // ToggleLonLatMapShow(this.show);
        //
        //     }
        // },
    ])
</script>

<style lang="less" scoped>
    img{
        right: 22px;
        bottom:800px;
        width:30px;height:30px;
    }
</style>