<!--
 * Created by wqy
 * Date 2022/12/22 14:07
 * Description
-->
<template>
    <div id="BookChapter" class="containerHole">
<!--        <span @click="$emit('bookcontent')">123</span>-->
        <div id="header" class="width100percent">
            <div style="height:calc(100% - 2px);" class="width100percent">
                <div class="float-right title">
                    <span>Twenty Thousand Leagues Under the Sea</span>
                    by
                    <span>Juless</span>
<!--                    <div class="btn">Turn off the lights</div>-->
                </div>
            </div>
            <div class="interval"></div>
        </div>
        <div id="content">
          <embed class="containerHole"
                   :src="'/books-library.online-12201129Vw2E1.pdf'+(page==undefined?'':'#page='+page)" type="application/pdf"/>

        </div>
        <div id="footer">
            <div class="interval">
            </div>
            <ul>
                <li @click="$emit('previous')">&lt;&ensp;&lt;&ensp;Previous</li>
                <li @click="$emit('bookcontent')">Home</li>
                <li @click="$emit('next')">Next&ensp;&gt;&ensp;&gt;</li>
            </ul>
        </div>
    </div>
</template>

<script setup>


    const props = defineProps(['page']);



</script>

<style scoped>
    .interval{
        width:100%;height:1px;background-color:#666;
    }
    #BookChapter {
        padding: 12px;
        box-sizing: border-box;
        background-color:#ffffff;
        color:#555;

        position:absolute;top:0px;
    }
    #BookChapter #header{
        height:100px;
        padding-top:20px;
        /*padding:30px 20px 0px 20px;*/
        box-sizing: border-box;

        font-size: 16px;
        font-family: Baskerville, "Times New Roman", serif;
        text-align: right;
    }
    #BookChapter #header span{
        font-size: 1.3em;
        font-style: italic;
    }
    #BookChapter #header .title{
        margin-right: 12px;
    }
    #BookChapter #header .btn{
        appearance: none;
        background:none;
        margin-top:14px;
        font-size: 0.8em;
        font-style: italic;
        color: #555;
        cursor: pointer;

    }
    #BookChapter #content{
        height:calc(100% - 160px);
    }
    #BookChapter #footer{
        height:60px;
        font-family: Baskerville, "Times New Roman", serif;
    }
    #BookChapter #footer ul{
        text-align: center;
        cursor:pointer;
        display: block;
        list-style-type: disc;
        margin-top:24px;
    }
    #BookChapter #footer ul li{
        list-style-type: none;
        display: inline;
        font-size: 18px;
        font-style:italic;
        margin:16px;

    }
</style>