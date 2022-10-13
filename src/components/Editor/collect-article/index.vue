<template>
  <BasicDialog :visible="visible" width="600px" height="50px" >
    <div slot="title">
      <span>采集文章</span>
      <span class="collect-article_lable">如需获得正式使用权，请自行联系版权所有者</span>
    </div>
    <div class="collect-article_content">
      <div class="tip">请把需要采集的文章链接粘贴在下方的输入框：</div>
      <el-input v-model="input" placeholder="仅支持微信链接"></el-input>
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
    linkContent: {
      type: String,
      default: ''
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
    input: {
      get() {
        return this.linkContent
      },
      set(val) {
        this.$emit('update:linkContent', val)
      }
    }
  },
  mounted() {
  },
  methods: {
    emitEvent() {
      var event = new MouseEvent('click')
      var ele = document.getElementsByClassName('video-input')
      ele[0].dispatchEvent(event)
    },
    // submit() {
    //   this.$emit('submit')
    // }
  }
}
</script>
<style lang="less">
.collect-article_lable{
  font-size: 14px;
  color: #333333;
  margin-left: 30px;
}
.collect-article_content{
  margin-top: 30px;
  .tip{
    font-size: 14px;
    color: #999999;
    margin-bottom: 5px;
  }
}
</style>
