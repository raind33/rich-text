<template>
  <BasicDialog :visible="visible">
    <span slot="title">插入图片</span>
    <div :class="['insert-img', !imgList.length ? 'no-img' : '']">
      <div v-if="!imgList.length" class="upload-wrap">
        <div class="upload-wrap_box" @click="emitEvent">
          <i class="el-icon-picture-outline"></i>
          <span>本地上传</span>
        </div>
        <span class="remark">支持jpg、jpeg、png等多种格式，单张图片最大支持20MB</span>
      </div>
      <div v-else class="img-list">
        <draggable v-model="imgListTemp" handle=".img-item" class="img-wrap" group="people" @start="drag=true" @end="drag=false">
          <div v-for="img in imgListTemp" :key="img.id" class="img-item">
            <img :src="img.src" style="object-fit: cover;" width="120" height="120"/>
            <i class="el-icon-error icon" @click="deleteImg(img)"></i>
          </div>
          <div class="upload-icon pointer" @click="emitEvent">
            <i class="el-icon-plus"></i>
          </div>
        </draggable>
      </div>
      <div class="upload-btn">
        <input
          type="file"
          name="file"
          multiple
          class="imageFile"
          accept="image/*"
          @change="selectImgs($event)"
        />
      </div>
    </div>
  </BasicDialog>
</template>
<script>
import BasicDialog from '../../basic-dialog/index.vue'
import draggable from 'vuedraggable'
import { v4 as uuidv4 } from 'uuid';

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
    imgList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      keyword: '',
      params: {
        autherid: '',
        radio: '1'
      },
      fileList: [],
      radio: '',
      data: [],
      busy: false
    }
  },
  computed: {
    imgListTemp: {
      get() {
        return this.imgList
      },
      set(val) {
        this.$emit('update:imgList', val)
      }
    }
  },
  mounted() {
  },
  methods: {
    selectImgs(e) {
      const imgFile = e.target.files;
      const tempImgs = [...this.imgList]
      Array.from(imgFile).forEach(file => {
        if (file.size > 20 * 1024 * 1024) {
          this.$message.error('单张图片最大支持20M')
          return
        }
        const id = uuidv4()
        const url = URL.createObjectURL(file)
        tempImgs.push({ id, src: url, file: file })
      })
      e.target.value = ''
      this.$emit('update:imgList', tempImgs)
    },
    deleteImg(img) {
      const arr = this.imgList.filter(item => item.id !== img.id)
      this.$emit('update:imgList', arr)
    },
    emitEvent() {
      var event = new MouseEvent('click')
      var ele = document.getElementsByClassName('imageFile')
      ele[0].dispatchEvent(event)
    }
  }
}
</script>
<style lang="less">
.insert-img{
  overflow-y: auto;
  height: 450px;
  &.no-img{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .upload-wrap{
    display: flex;
    flex-direction: column;
      align-items: center;
      justify-content: center;
    .upload-wrap_box{
      font-size: 14px;
      cursor: pointer;
      color: #999999;
      width: 310px;
      height: 210px;
      border-radius: 10px;
      border: 1px solid #E8E8E8;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      span{
        margin-top: 10px;
      }
      i{
        font-size: 50px;
        color: #9E9E9E;
      }
    }
    .remark{
      font-size: 14px;
      color: #999999;
      margin-top: 20px;
    }

  }
  .upload-btn{
      display: none;
    }
  .img-list{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 30px;
    .img-item{
      position: relative;
      margin-right: 20px;
      margin-bottom: 10px;
      .icon{
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(50%, -50%);
      }
    }
  }
  .img-wrap{
    display: flex;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  .upload-icon{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px;
    height: 120px;
    background: #FAFAFA;
    border-radius: 4px;
    border: 1px solid #E8E8E8;
  }
}
</style>
