<template>
  <div class="article-item" contenteditable="false">
    <img v-if="article.img || (article.mediaInfo && article.mediaInfo.length)" :src="article.img || article.mediaInfo[0].img" alt="">
    <div class="article-item_right">
      <div class="name">{{ article.title }}</div>
      <div class="score">
        <span>{{ article.author }}</span>
        <span>{{ article.viewNum }}浏览</span>
        <span>{{ article.replycnt }}评论</span>
      </div>
    </div>
    <i class="el-icon-error icon pointer" @click="close"></i>
    <div
      v-if="article && article.cardEassyFlag"
      :class="{
        'article-bg-height':
          article.img || (article.mediaInfo && article.mediaInfo.length),
      }"
      class="article-bg"
    >
      平台仅支持展示18个月的推荐内容
    </div>
  </div>
</template>
<script>
export default {
  props: {
    article: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    close(e) {
      let child = e.target;
      while (child) {
        if (child.dataset.article) {
          child.parentNode.removeChild(child);
          break;
        }
        child = child.parentNode;
      }
      this.$emit('delete')
    },
  },
};
</script>
<style lang="less" scoped>
.article-item {
  user-select: none;
  display: flex;
  margin: 0 auto;
  padding: 8px;
  background: #f7f8f9;
  border-radius: 4px;
  width: 440px;
  position: relative;
  .icon {
    user-select: none;
    position: absolute;
    top: 0;
    right: 0;
    color: #b7b7b7;
    transform: translate(50%, -50%);
  }
  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    margin-right: 12px;
    flex-shrink: 0;
  }
  .article-item_right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .name {
      font-size: 16px;
      line-height: 22px;
      margin-top: 5px;
      line-height: 22px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .score {
      color: #999999;
      line-height: 17px;
      font-size: 12px;
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      span:nth-child(2) {
        margin-left: 10px;
      }
      span:nth-child(3) {
        margin-left: 10px;
      }
    }
    .price {
      color: #ff5a25;
      font-size: 16px;
      margin-top: 6px;
    }
  }
  .article-bg {
    position: absolute;
    width: 440px;
    height: 60px;
    left: 0;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 4px;
    line-height: 60px;
    text-align: center;
    font-size: 18px;
    font-weight: 400;
    color: #ffffff;
    backdrop-filter: blur(3px);
  }
  .article-bg-height {
    height: 80px;
    line-height: 80px;
  }
}
</style>
