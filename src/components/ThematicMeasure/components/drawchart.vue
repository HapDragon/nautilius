<!--
 * Created by wqy
 * Date 2023/3/2 16:08
 * Description
-->
<template>
    <div id="drawchart" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0)" :element-loading-text="loadingtext" v-show="show" @mouseleave="onleavechart">

    </div>
</template>

    <script setup>
    import {drawchartpoi,ClearDrawChartPoi} from '../buss/thematicmeasure'
    import Bus from '../../../buss/Bus'
    import {FormatLatitude,FormatLongitude} from "../../../buss/cesiumviewer";

    const loadingtext=ref("0%");
    const loading=ref(false);
    const show=ref(false);
    Bus.VM.$on(Bus.SignalType.DRAWCHARTPROGRESS,function (percent) {
        loadingtext.value=parseInt(percent*100)+"%";
    })
    Bus.VM.$on(Bus.SignalType.STARTDRAWCHART,function () {
        show.value=true;
        loading.value=true;
        loadingtext.value="0%";
        clearbar();
    })
    Bus.VM.$on(Bus.SignalType.DRAWCHART,function (data) {
        loading.value=false;
        refreshbar(data);
    })
    Bus.VM.$on(Bus.SignalType.CLOSECHART,function () {
        show.value=false;
        clearbar();
    });
    function onleavechart() {
        ClearDrawChartPoi();
    }
    function clearbar() {
        let barcontainer = document.getElementById("drawchart");
        let barChart = echarts.init(barcontainer);
        barChart.clear()
    }
    function refreshbar(data) {
        let barcontainer = document.getElementById("drawchart");
        let barChart = echarts.init(barcontainer);
        let ydata=data.map(item => {
            return item.height;
        });



        let option = {
            title: {
                show: false
            },
            grid: {
                top: 20,
                bottom: 20,
                left:50,
                right:20
            },
            color: ['#ffcc00'],
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    let param = data[params[0].axisValue];
                    drawchartpoi(param.lng,param.lat);
                    return "Longitude:"+FormatLongitude((parseInt(param.lng*100))/100)+
                        "</br>Latitude:"+FormatLatitude((parseInt(param.lat*100))/100)+"</br>Height:"+(parseInt(param.height*100))/100+"m"+"</br>Distance:"+(parseInt(param.dis*100))/100+"m";
                },
                axisPointer: {
                    animation: false
                }
            },
            xAxis: {
                type: 'category',
                // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                data: data.map(item => {
                    return item.id;
                }),
                axisLine: {
                    lineStyle: {
                        color: "#fff"
                    }
                },
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: "#fff"
                    }
                },
                // min: 0,
                // max:ymax
            },
            series: [{
                // data: [820, 932, 901, 934, 1290, 1330, 1320],
                data: ydata,
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
            }]
        };
        barChart.setOption(option, true);

    };

</script>

<style lang="less" scoped>
#drawchart{
    --el-mask-color:transparent;
    position:absolute;
    bottom:20px;
    height:200px;
    left:0;right:0;
    width:600px;
    margin:auto;
    background-color:#00dddd66;

    --el-color-primary:#FF69B4;
}
</style>