<template>
  <BasicDialog :visible="visible" @submit="confirm">
    <span slot="title">插入文章<strong style="margin-left: 20px; color: #FF5A25">平台仅支持插入18个月内的推荐内容</strong></span>
    <div class="insert-article">
      <div>
        <el-radio v-model="params.radio" label="1">从我的文章中选择</el-radio>
        <el-radio v-model="params.radio" label="2">从所有文章中选择</el-radio>
      </div>
      <div class="insert-article_input">
        <el-input
          v-model="params.title"
          placeholder="输入标题名查找平台发过的文章"
          @keyup.enter.native="getArticleList(true)">
          <i slot="suffix" class="pointer el-input__icon el-icon-search" @click="getArticleList(true)"></i>
        </el-input>

      </div>
      <div v-if="data.length === 0 && !busy" class="nodata">没有符合条件的文章哦，你可以试试搜索其他文章～</div>
      <div v-infinite-scroll="getArticleList" v-else infinite-scroll-immediate-check="false" class="insert-article_list" infinite-scroll-disabled="disable" infinite-scroll-distance="10">
        <div v-for="(item, index) in data" :key="index" class="insert-article_list-item">
          <el-radio v-model="radio" :label="item.id" @change="select(item)"><div style="display: inline-flex;flex-direction: column;"><span>{{ item.title || '[无标题]' }}</span><span>{{ $date.format(item.createTime*1000, 'YYYY-MM-DD') }}</span></div></el-radio>
          <!-- <div class="insert-article_list-item_title">
            <span>{{ item.title || '[无标题]' }}</span>
            <span>{{ $date.format(item.createTime*1000, 'YYYY-MM-DD') }}</span>
          </div> -->
          <!-- <span class="view pointer" @click="view(item)">查看文章{{ item.name }}</span> -->
        </div>
      </div>

    </div>
  </BasicDialog>
</template>
<script>
import BasicDialog from '../../basic-dialog/index.vue'
// import { getArticleList } from '@/assets/js/api'

export default{
  provide() {
    return {
      vm: this
    }
  },
  components: {
    BasicDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    getList: {
      type: Function,
    }
  },
  data() {
    return {
      params: {
        autherid: '',
        radio: '1',
        title: '',
      },
      article: '',
      finished: false,
      page: 0,
      radio: '',
      data: [],
      busy: true
    }
  },
  computed: {
    disable() {
      return this.finished || this.busy
    }
  },
  watch: {
    'params.radio' (val) {
      this.getArticleList(true)
    }
  },
  mounted() {
    this.getArticleList(true)
  },
  methods: {
    select(item) {
      this.article = item
    },
    confirm() {
      if (!this.article) return this.$message.error('请选择文章')
      this.$emit('change', this.article)
    },
    view(item) {
      window.open(`https://www.jddmoto.com/article/0/${item.id}.html`)
    },
    async getArticleList(reset) {
      if (reset) {
        this.finished = false
        this.page = 0
        this.data = []
      }
      if (this.finished) return
      this.busy = true
      const userInfo = JSON.parse(localStorage.getItem('user')) ||  JSON.parse(localStorage.getItem('userInfo'))
      const userId = userInfo.uid || userInfo.userid
      const res = await this.getList({
        uid: this.params.radio === '1' ? userId : '',
        autherid: this.params.radio === '1' ? userId : '',
        limit: 20,
        allType: 1,
        title: this.params.title,
        page: ++this.page
      })
      if (res.data.code === 0) {
        this.total = res.data.data.total
        this.data = this.data.concat(res.data.data.listData)
        if (this.data.length >= this.total) {
          this.finished = true
        }
      }
      this.busy = false
    }
  }
}
</script>
<style lang="less">
.insert-article{
  margin-top: 30px;
  .nodata{
    text-align: center;
    color: #999999;
    font-size: 14px;
    margin-top: 40px;
  }
  .insert-article_input{
    margin-top: 20px;
  }
  .insert-article_list{
    height: 304px;
    overflow: auto;
    border: 1px solid #F6F6F8;
    margin-top: 4px;
    &-item{
      display: flex;
      align-items: center;
      height: 56px;
      padding-left: 20px;
      padding-right: 30px;
      .el-radio__label{
        display: inline-block;
        vertical-align: middle;
      }
      &:not(:last-child){
        border-bottom: 1px solid #F6F6F8;
        span:nth-child(1){
          line-height: 20px;
          font-size: 14px;
        }
        span:nth-child(2){
          line-height: 17px;
          font-size: 12px;
        }
      }
      &_title{
        display: flex;
        flex-direction: column;
        flex: 1;

      }
    }
  }
  .view{
    color: #5388F5;
  }
}
</style>
