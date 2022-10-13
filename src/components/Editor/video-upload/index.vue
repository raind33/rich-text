<template>
  <BasicDialog :show-btn="false" :visible="visible" width="600px" height="100px">
    <span slot="title">插入视频</span>
    <div class="insert-video">
      <el-button style="width: 120px;" round type="primary" @click="emitEvent">选择视频</el-button>
      <span class="remark">为了获得更高的推荐量和点击量，建议上传720p（1280*720）或更高分辨率的视频，视频格式为.mp4或.mov，大小不超过1G</span>
      <input
        type="file"
        accept="video/*"
        name="file"
        class="video-input"
        @change="fileSelected($event, 'insertVideo')"
      />
    </div>
  </BasicDialog>
</template>
<script>
import BasicDialog from '../../basic-dialog/index.vue'
import draggable from 'vuedraggable'
export default{
  provide() {
    return {
      vm: this
    }
  },
  components: {
    BasicDialog,
    draggable
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    fileSelected: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {
    emitEvent() {
      var event = new MouseEvent('click')
      var ele = document.getElementsByClassName('video-input')
      ele[0].dispatchEvent(event)
    }
  }
}
</script>
<style lang="less">
.insert-video{
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
  .video-input{
    display: none;
  }
  .remark{
    font-size: 14px;
    color: #999999;
    margin-top: 12px;
    text-align: center;
  }
}
</style>
