<template>
  <div class="tools" v-if="editor.fontInfo">
    <div class="tools-content">
      <el-tooltip class="item" effect="dark" content="撤回" placement="top">
        <img id="undo" :src="require('@/assets/img/tools/tools_back@3x.png')" width="40" height="40" alt="" srcset="" @click="back($event)">
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="反撤回" placement="top">
        <img id="redo" :src="require('@/assets/img/tools/tools_forwar@3x.png')" width="40" height="40" alt="" srcset="" @click="forward($event)">
      </el-tooltip>
      <el-divider class="m12" direction="vertical"></el-divider>
      <el-tooltip class="item" effect="dark" content="清除格式" placement="top">
        <img :src="require('@/assets/img/tools/tools_clear@3x.png')" width="40" height="40" alt="" srcset="" @click="clearFormat">
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="格式刷" placement="top">
        <div class="box">
          <img :src="require('@/assets/img/tools/tools_refresh@3x.png')" width="40" height="40" alt="" srcset="" @click="copyFormat">
          <div v-if="editor.cursorStyle !== 'auto'" class="box-mask"></div>
        </div>
      </el-tooltip>
      <el-divider class="m12" direction="vertical"></el-divider>
      <!-- <img :src="require('@/assets/img/tools/tools_clear@3x.png')" width="40" height="40" alt="" srcset="">
    <img :src="require('@/assets/img/tools/tools_refresh@3x.png')" width="40" height="40" alt="" srcset=""> -->
      <!-- <el-divider direction="vertical"></el-divider> -->
      <el-popover
        v-model="popoverVisibleFont"
        placement="bottom"
        width="152"
        trigger="manual"
      >
        <div slot="reference" class="tools-title">
          <el-tooltip class="item" effect="dark" content="字号" placement="top">
            <div ref="font" :class="[ editor.setAlignFlag ? '' : 'disable', 'tools-title']" @click="showDialog('popoverVisibleFont')">
              <span>{{ activeFontsize }}</span>
              <img :src="require('@/assets/img/tools/tools_arrow@3x.png')" width="16" height="40" alt="" srcset="">
            </div>
          </el-tooltip>
        </div>
        <ul v-click-outside="handlePopover" class="tools-font">
          <li v-for="(item, index) in fontsizes" :class="[activeFontsize === item.value ? 'active' : '']" :key="index" data-editor-id="setFontSize" @click="setFont($event, item.value)">
            <span :style="{fontSize:item.value}">{{ item.name }}</span>
            <span style="font-size: 10px;">{{item.desc}}</span>
          </li>
        </ul>
      </el-popover>
      <el-divider class="ml16 mr12" direction="vertical"></el-divider>
      <!-- <div style="margin-left: 20px;">
        <el-popover
          placement="bottom"
          width="152"
          trigger="click"
        >
          <div slot="reference" class="tools-title">
            <span>{{ headType===0? '正文' : '标题' }}</span>
            <img :src="require('@/assets/img/tools/tools_arrow@3x.png')" width="16" height="40" alt="" srcset="">
          </div>
          <ul class="tools-title_content">
            <li data-editor-id="makeHeader" @click="setTitle($event, 0)">正文</li>
            <li data-editor-id="makeHeader" @click="setTitle($event, 1)">标题</li>
          </ul>
        </el-popover>
      </div> -->
      <el-tooltip class="item" effect="dark" content="标题" placement="top">
        <div class="box">
          <img :src="require('@/assets/img/tools/tools_title@3x.png')" data-editor-id="makeHeader" width="40" height="40" alt="" srcset="" @click="setTitle($event, statusInfo.title ? 0 : 1)">
          <div v-if="statusInfo && statusInfo.title" class="box-mask"></div>
        </div>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="加粗" placement="top">
        <div class="box">
          <img :src="require('@/assets/img/tools/tools_bold@3x.png')" width="40" height="40" alt="" srcset="" @click="setStyle(statusInfo.bold?'removeBold':'bold', 'bold', !statusInfo.bold)">
          <div v-if="statusInfo && statusInfo.bold" class="box-mask"></div>
        </div>
      </el-tooltip>
      <div>
        <el-popover
          placement="bottom"
          v-model="popoverVisibleList"
          width="152"
          trigger="manual"
        >
          <div slot="reference" class="tools-title">
            <el-tooltip class="item" effect="dark" content="列表" placement="top">
              <div ref="list" :class="[ editor.setAlignFlag ? '' : 'disable']" @click="showDialog('popoverVisibleList')">
                <img :src="require('@/assets/img/tools/tools_list@3x.png')" width="24" height="40" alt="" srcset="">
                <img :src="require('@/assets/img/tools/tools_arrow@3x.png')" width="16" height="40" alt="" srcset="">
              </div>
            </el-tooltip>
          </div>
          <ul v-click-outside="handlePopover" class="tools-title_content">
            <li data-editor-id="makeHeader" @click="setStyle('makeUnorderedList')">无序列表</li>
            <li data-editor-id="makeHeader" @click="setStyle('makeOrderedList')">有序列表</li>
          </ul>
        </el-popover>
      </div>
      <el-tooltip class="item" effect="dark" content="倾斜" placement="top">
        <div class="box">
          <img :src="require('@/assets/img/tools/tools_xie@3x.png')" width="40" height="40" alt="" srcset="" @click="setStyle(statusInfo.italic?'removeItalic':'italic', 'italic', !statusInfo.italic)">
          <div v-if="statusInfo && statusInfo.italic" class="box-mask"></div>
        </div>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="下划线" placement="top">
        <div class="box">
          <img :src="require('@/assets/img/tools/tools_line@3x.png')" width="40" height="40" alt="" srcset="" @click="setStyle(statusInfo.underline?'removeUnderline':'underline', 'underline',!statusInfo.underline)">
          <div v-if="statusInfo && statusInfo.underline" class="box-mask"></div>
        </div>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="链接" placement="top">
        <div class="box">
          <img :src="require('@/assets/img/tools/icon_web_link@2x.png')" width="40" height="40" alt="" srcset="" @click="insertLink">
        </div>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="首行缩进" placement="top">
        <img :src="require('@/assets/img/tools/tools_indent@3x.png')" width="40" height="40" alt="" srcset="" @click="setStyle('setIndent')">
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="文字颜色" placement="top">
        <div class="wrap">
          <img :src="require('@/assets/img/tools/tools_color@3x.png')" width="24" height="40" alt="" srcset="">
          <img :src="require('@/assets/img/tools/tools_arrow@3x.png')" width="16" height="40" alt="" srcset="">
          <colorPicker v-model="color" @change="setColor" />
        </div>
      </el-tooltip>

      <el-divider class="m12" direction="vertical"></el-divider>
      <el-popover
        v-model="popoverVisible"
        placement="bottom"
        width="152"
        trigger="manual"
      >
        <div slot="reference" class="tools-title">
          <el-tooltip class="item" effect="dark" content="对齐方式" placement="top">
            <div ref="align" :class="[ editor.setAlignFlag ? '' : 'disable']" @click="showPopover">
              <img :src="require('@/assets/img/tools/tools_align@3x.png')" width="24" height="40" alt="" srcset="">
              <img :src="require('@/assets/img/tools/tools_arrow@3x.png')" width="16" height="40" alt="" srcset="">
            </div>
          </el-tooltip>
        </div>
        <ul v-click-outside="handlePopover" class="tools-title_content">
          <li v-for="(item, index) in alignMethods" :class="[activeAlign === item.value ? 'active' : '']" :key="index" data-editor-id="setTextAlignment" @click="setAlign($event, item.value)">{{ item.name }}</li>
        </ul>
      </el-popover>
      <el-divider class="ml16 mr12" direction="vertical"></el-divider>
      <el-tooltip class="item" effect="dark" content="插入图片" placement="top">
        <img :src="require('@/assets/img/tools/tools_img@3x.png')" width="40" height="40" alt="" srcset="" @click="insertImg">
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="插入视频" placement="top">
        <img :src="require('@/assets/img/tools/tools_video@3x.png')" width="40" height="40" alt="" srcset="" @click="insertVideo">
      </el-tooltip>
      <el-tooltip v-if="!showToolsArticle" class="item" effect="dark" content="插入文章" placement="top">
        <img :src="require('@/assets/img/tools/tools_article@3x.png')" width="40" height="40" alt="" srcset="" @click="insertArticle">
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="采集文章" placement="top">
        <img :src="require('@/assets/img/tools/tools_link@3x.png')" width="40" height="40" alt="" srcset="" @click="collectArticle">
      </el-tooltip>
    </div>
  </div>
</template>
<script>
export default {
  props: ['editor', 'isOss'],
  data() {
    return {
      color: '',
      popoverVisibleFont: false,
      headType: 0,
      popoverVisible: false,
      showToolsArticle: true,
      popoverVisibleList: false,
      activeAlign: '',
      alignMethods: [
        { value: 'left', name: '左对齐' },
        { value: 'right', name: '右对齐' },
        { value: 'center', name: '居中对齐' },
        { value: 'justify', name: '两端对齐' },
      ],
      activeFontsize: '17',
      fontsizes: [
        { value: '17px', name: '17', desc: '默认正文字号' },
        { value: '18px', name: '18', desc: '默认标题字号' },
        { value: '19px', name: '19' },
        { value: '20px', name: '20' },
        { value: '24px', name: '24' },
        { value: '32px', name: '32' }
      ],
      statusInfo: {
        bold: false,
        italic: false,
        underline: false
      }
    }
  },
  computed: {
    fontInfo() {
      if(this.editor.fontInfo) {
        const info = JSON.parse(JSON.stringify(this.editor.fontInfo))
        info.size = parseInt(info.size)
        if (info.size === 100 || !info.size) {
          info.size = 17
        }
        return info
      }
      return {
        size: ''
      }
    },
    styleStatus() {
      return this.editor.styleStatus
    }
  },
  watch: {
    'fontInfo.size'(val) {
      this.activeFontsize = val
    },
    styleStatus: {
      handler(val) {
        this.statusInfo = val
      },
      immediate: true
    }
  },
  mounted() {
    if(!this.isOss) {
      const user = JSON.parse(window.localStorage.getItem('user') || '{}');
      const certifyList = user.certifyList.map(item => { return item.type }) || []
      this.showToolsArticle = certifyList.includes('11')
    }
  },
  methods: {
    
    insertLink() {
      this.editor.showLink()
    },
    clearFormat() {
      this.editor.clearFormat()
    },
    setColor(val) {
      this.editor.setColor(val)
    },
    setStyle(type, key, flag) {
      this.popoverVisibleList = false
      if (this.statusInfo[key] !== undefined) {
        this.statusInfo[key] = flag
      }
      this.editor.setStyle(type)
    },
    insertArticle() {
      this.editor.uploadArticle()
    },
    insertImg() {
      this.editor.uploadImg()
    },
    insertVideo() {
      this.editor.showUploadVideo()
    },
    collectArticle() {
      this.editor.collectArticle()
    },
    back(e) {
      this.editor.setContent(e)
    },
    forward(e) {
      this.editor.setContent(e)
    },
    setTitle(e, type) {
      this.headType = type
      this.editor.setContent(e, {
        makeHeader: {
          type
        }
      })
    },
    copyFormat() {
      this.editor.setCursor()
    },
    handlePopover(e) {
      const target = this.$refs['align']
      const font = this.$refs['font']
      const list = this.$refs['list']
      if (target.contains(e) || font.contains(e) || list.contains(e)) return
      this.popoverVisible = false
      this.popoverVisibleFont = false
      this.popoverVisibleList = false
    },
    setAlign(e, type) {
      this.editor.setAlign(e, type)
      this.popoverVisible = false
    },
    setFont(e, type) {
      this.activeFontsize = parseInt(type)
      this.editor.setFontSize(e, type)
      this.popoverVisibleFont = false
    },
    showDialog(type) {
      this[type] = true
    },
    showPopover() {
      if (!this.editor.setAlignFlag) return
      this.activeAlign = this.editor.getCursorAlignStyle()
      this.popoverVisible = true
    },
    openDialog(type) {
      this.editor.openDialog(type)
    }
  }
}
</script>
<style lang="less" scoped>
.m12{
  margin: 0 12px;
}
.ml16{
  margin-left: 16px;
}
.mr12{
  margin-right: 12px;
}
.ml12{
  margin-left: 12px;
}
.mr18{
  margin-right: 18px;
}
.tools{

  background: #FAFAFA;
  .tools-content{
    display: flex;
    align-items: center;
  }
  img{
    cursor: pointer;
  }
  .box{
    position: relative;
    .box-mask{
      width:40px;height:40px;background: black;opacity:0.2; top: 0;position: absolute;
      pointer-events: none;
    }
  }
  .tools-title{
    color: #333333;
    font-size: 18px;
    display: flex;
    align-items: center;

  }
  .disable{
    cursor: not-allowed;
    filter: blur(0.6px);
    img{
      cursor: not-allowed;
    }
  }
  .wrap{
    position: relative;
  }
  /deep/ .m-colorPicker{
    position: absolute;
    width: 100%;
    left: 0;
    height: 100%;
    .colorBtn{
      width: 100%;
      height: 100%;
      opacity: 0;
    }
  }
}
</style>
<style lang="less">
.tools-title_content{
  padding-left: 30px;
  font-size: 18px;
  li{
    cursor: pointer;
    &.active{
      color: red;
    }
  }
  li~li{
    margin-top: 18px;
  }
}
.tools-font{
  li{
    display: flex;
    align-items: center;
    span:nth-child(2){
      margin-left: 5px;
    }
  }
}
</style>
