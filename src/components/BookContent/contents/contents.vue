<!--
 * Created by wqy
 * Date 2022/12/20 15:20
 * Description
-->
<template>
    <div id="contents" class="containerHole">
        <div id="header">
            <canvas id="glslCanvas"
                    data-fragment-url="/frag/sea.frag"
                    data-textures="/frag/moon.jpg"
                    width="500" height="400"
                    style="background-color:rgba(0,0,0,1);"
            ></canvas>
            <!--            <canvas id="glslCanvas" class="containerHole"-->
            <!--                    v-show="startexpand===true"-->
            <!--                    data-fragment-url="/frag/sea.frag"-->
            <!--            ></canvas>-->
            <h1 style="top:0px;font-style: italic;font-size: 3.0em;" class="position-absolute"
                v-show="collapsed===false">Twenty Thousand Leagues Under the Sea</h1>
            <h2 style="top:230px;left:12px;" class="position-absolute" v-show="collapsed===false">----by Jules
                Verne</h2>

        </div>
        <div id="content" style="top:300px;width:calc(100% - 24px);" class="position-absolute"
             v-show="collapsed===false">
            <h2 style="font-style: italic;font-family: 'Book Antiqua'">Contents</h2>
            <div id="contentscrool" class="containerHole invisible_scrollheight">
                <h3 v-for="(item,index) in contentsdata">
                    <div >
                        <input type="checkbox" :checked="item.checked" @click="clickshowmap(item,undefined,index,undefined)"
                               class="verticalalign-textbottom" title="Show on earth"/>
                        {{item.label}}
                    </div>
                    <h4 v-for="(subitem,subindex) in item.children"> &emsp;

                        <input type="checkbox" :checked="subitem.checked" @click="clickshowmap(item,subitem,index,subindex)"
                               class="verticalalign-texttop" title="Show on earth"/>
                        <span>{{(index+1).toString()+"-"+(subindex+1).toString()}}{{getsubtitle(subitem.label,30)}}</span>
                        <img :src="bookinterimgsrc" title="enter to read" @click="$emit('readbookinter',index,subindex)">
                    </h4>
                </h3>
            </div>

        </div>
    </div>
</template>

<script setup>
    import GlslCanvas from 'glslCanvas'
    import {onToggleBookChapterShow,onToggleBookPartShow} from '../buss/bookcontent'

    const props = defineProps(['collapsed', 'startexpand']);
    const contentsdata = ref([
        {
            label: "Part I",
            children: [
                {label: "A Run away Reef",page:8},
                {label: "The Pros and Cons",page:13},
                {label: "As Master Wishes",page:18},
                {label: "Ned Land",page:23},
                {label: "At Random!",page:29},
                {label: "At Full Steam",page:34},
                {label: "A Whale of Unknown Species",page:42},
                {label: "Mobilis in Mobili",page:49},
                {label: "The Tantrums of Ned Land",page:56},
                {label: "The Man of the Waters",page:62},
                {label: "The Nautilus",page:70},
                {label: "Everything through Electricity",page:76},
                {label: "Some Figures",page:82},
                {label: "The Black Current",page:88},
                {label: "An Invitation in Writing",page:98},
                {label: "Strolling the Plains",page:106},
                {label: "An Underwater Forest",page:111},
                {label: "Four Thousand Leagues Under the Pacific",page:116},
                {label: "Vanikoro",page:122},
                {label: "The Torres Strait",page:130},
                {label: "Some Days Ashore",page:137},
                {label: "The Lightning Bolts of Captain Nemo.",page:147},
                {label: "Aegri Somnia",page:157},
                {label: "The Coral Realm",page:164},
            ],
        },
        {
            label:"Part II",
            children: [
                {label:"The Indian Ocean",page:171},
                {label:"A New Proposition from Captain Nemo",page:178},
                {label:"A Pearl Worth Ten Million",page:187},
                {label:"The Red Sea",page:196},
                {label:"Arabian Tunnel",page:206},
                {label:"The Greek Islands",page:214},
                {label:"The Mediterranean in Forty-Eight Hours",page:224},
                {label:"The Bay of Vigo",page:231},
                {label:"A Lost Continent",page:239},
                {label:"The Underwater Coalfields",page:247},
                {label:"The Sargasso Sea",page:256},
                {label:"Sperm Whales and Baleen Whales ",page:263},
                {label:"The Ice Bank",page:273},
                {label:"The South Pole",page:283},
                {label:"Accident or Incident?",page:293},
                {label:"Shortage of Air",page:300},
                {label:"From Cape Horn to the Amazon",page:308},
                {label:"The Devilfish",page:316},
                {label:"The Gulf Stream",page:325},
                {label:"In Latitude 47 degrees 24'",page:334},
                {label:"A Mass Execution",page:340},
                {label:"The Last Words of Captain Nemo",page:348},
                {label:"Conclusion",page:354}
            ]
        }
    ]);
    const bookinterimgsrc = ref(new URL(`../assets/bookinter.svg`, import.meta.url).href);


    onMounted(() => {
        var canvas = document.getElementById("glslCanvas");
        var sandbox = new GlslCanvas(canvas);
        canvas.style.width = '100%';
        // canvas.style.height = '100%';
    })

    function clickshowmap(item, subitem,itemindex,subitemindex) {
        if (item == undefined && subitem == undefined) return;

        if (subitem != undefined) {
            subitem.checked = !subitem.checked;

            onToggleBookChapterShow(itemindex,subitemindex,subitem.checked);
        }
        else if (item != undefined) {

            item.checked = !item.checked;
            item.children.forEach(sub => {
                sub.checked = item.checked;
            })

            onToggleBookPartShow(itemindex,item.checked)
        }
    }

    function getsubtitle(title, num) {
        if (title.length > num) {
            return title.substr(0, num - 1) + "...";
        } else
            return title;
    }

    function GetPageByindex(index,subindex) {
        return contentsdata.value[index].children[subindex].page;
    }
    function GetPrevious(index,subindex){
        if(subindex==0){
            if(index>0){
                index--;
                subindex=contentsdata.value[index].children.length-1;
            }
        }
        else{
            subindex--;
        }
        return [index,subindex];

    }
    function GetNext(index,subindex){
        if(subindex==contentsdata.value[index].children.length-1){
            if(index==0){
                index++;
                subindex=0;
            }
        }
        else{
            subindex++;
        }
        return [index,subindex];
    }

    defineExpose({
        GetPageByindex,
        GetPrevious,
        GetNext
    })



</script>

<style scoped>
    #contents {
        padding: 12px;
        box-sizing: border-box;
    }

    #contents #header {
        width: 100%;
        height: 100%;
    }

    #contents #content h3, #contents #content h4 {
        font-family: "Bookman Old Style";
    }


    #contents #content #contentscrool {
        height: 60vh;
    }

    #contents #content h3 div {

    }

    #contents #content h4 {
        margin: 4px 0px;
        font-size: 0.8em;
        /*border:1px solid #646cffdd;*/
        /*background-color:#646cffdd;*/


        width: 100%;
        display: inline-block;


    }

    #contents #content h4 span {
        text-decoration: #fff solid underline;
        cursor: pointer;
    }

    #contents #content h4 img {
        width: 24px;
        height: 24px;
        float: left;
        /*margin-right: 12px;*/
        margin-right: -12px;
    }

</style>