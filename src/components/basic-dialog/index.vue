<template>
  <el-dialog
    :visible.sync="visible"
    :before-close="handleClose"
    :width="width"
    custom-class="basic-dialog">
    <div slot="title" :style="{height: height}" class="basic-dialog_content">
      <div class="basic-dialog_title">
        <span class="basic-dialog_divider"></span>
        <slot name="title"></slot>
      </div>
      <slot></slot>
    </div>
    <span v-if="showBtn" slot="footer" class="dialog-footer">
      <el-button style="width: 120px;border-color:#CCCCCC;color: #333333;" plain round @click="handleClose">取消</el-button>
      <el-button style="width: 120px;" round type="primary" @click="confirm">确认</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  inject: ['vm'],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    height: {
      type: String,
      default: '400px'
    },
    showBtn: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: '840px'
    }
  },
  methods: {
    handleClose() {
      this.vm.$emit('update:visible', false)
      this.$emit('cancel')
    },
    confirm() {
      this.vm.$emit('submit')
      this.$emit('submit')
    }
  }
}
</script>
<style lang="less">
.basic-dialog{

  .basic-dialog_content{

    height: 400px;
  }
  .basic-dialog_title{
    display: flex;
    align-items: center;
    font-size: 16px;
    &>span:nth-child(2){
      font-weight: bold;
    }
  }
  .basic-dialog_divider{
    width: 3px;
    height: 14px;
    background: #FF3C08;
    margin-right: 7px;
  }
  .el-button--primary{
    background: #FF5A25;
    border-color: #FF5A25;
  }
  .dialog-footer{
    display: flex;
    width: 100%;
    justify-content: center;
  }
}
</style>
