<!--
 * Created by wqy
 * Date 2022/12/20 13:57
 * Description
-->
<template>
    <div id="BookContent" class="position-fixed" ref="BookContentComp" :style="curexpand=='expand'?'width:40px;':''">


        <div class="containerHole">
            <component :is="bookcontentcomps.get('contents')" ref="contents"
                       :collapsed="curexpand=='expand'" :startexpand="startexpand"
                       @readbookinter="onreadinter"
            ></component>
            <component :is="bookcontentcomps.get('bookchapter')" ref="bookchapter" v-show="curpage=='bookchapter'"
                       :page="page"
                       @bookcontent="onreturncontent" @previous="onprevious" @next="onnext"
            ></component>
        </div>

        <img v-for="(item,index) in arrows" class="position-absolute"
             :src="item.url" :style="item.style" :title="item.title" v-show="item.title==curexpand" @click="item.onclick">
    </div>
</template>

<script setup>
    const page=ref(null);

    const arrows=reactive([
        {
            title:"expand",
            url:new URL(`./assets/rightarrow.svg`, import.meta.url).href,
            style:"left:0px;",
            onclick:function () {
                BookContentComp.value.style.width='20vw';
                BookContentComp.value.style.transition='width 2s';
                startexpand.value=true;
                setTimeout(function () {
                    curexpand.value="close";
                },2000)
            }
        },
        {
            title:"close",
            url:new URL(`./assets/leftarrow.svg`, import.meta.url).href,
            style:"right:0px;",
            onclick:function () {
                BookContentComp.value.style.width='40px';
                BookContentComp.value.style.transition='width 2s';
                curexpand.value="expand";
                setTimeout(function () {
                    startexpand.value=false;
                },2000)

            }
        },
    ])

    let curexpand=ref("expand");
    let startexpand=ref(false);
    let curpage=ref("contents");

    let bookcontentcomps=shallowRef(new Map());
    bookcontentcomps.value.set(
        'contents',
        defineAsyncComponent(()=>import('./contents/contents.vue'))
    );
    bookcontentcomps.value.set(
        'bookchapter',
        defineAsyncComponent(()=>import('./contents/BookChapter.vue'))
    );
    const BookContentComp=ref(null);
    const contents=ref(null);
    const bookchapter=ref(null);

    function onreadinter(index,subindex) {
        curpage.value='bookchapter'
        page.value=contents.value.GetPageByindex(index,subindex);
        page.curindex=index;
        page.cursubindex=subindex;
    }
    function onprevious() {
        var newindexsubindex=contents.value.GetPrevious( page.curindex,page.cursubindex);
        if(newindexsubindex[0]==page.curindex&&newindexsubindex[1]==page.cursubindex) return;
        onreadinter(newindexsubindex[0],newindexsubindex[1]);
    }
    function onnext() {
        var newindexsubindex=contents.value.GetNext( page.curindex,page.cursubindex);
        if(newindexsubindex[0]==page.curindex&&newindexsubindex[1]==page.cursubindex) return;
        onreadinter(newindexsubindex[0],newindexsubindex[1]);
    }
    function onreturncontent() {
        curpage.value='contents'
    }


</script>

<style scoped>
    #BookContent{
        background-color:#dddddd66;
        /*background-color:#00dddd66;*/
        background-color:#00dddd66;
        /*border:1px solid #cfcfcf;*/
        box-shadow: 0px 0px 10px 5px #ccc inset;
        height:100%;
        left:0px;
        top:0px;

        width:20vw;
        transition:width 2s
    }
    #BookContent img{
        width:32px;
        height:32px;
        top:calc(50% - 16px);

    }
</style>