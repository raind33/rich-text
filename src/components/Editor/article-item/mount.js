import Vue from 'vue'
import Item from './index.vue'
export const mountArticleDom = (props, del) => {
  const className = 'article-wrap'
  const article = props.article
  const vm = new Vue({
    render(h) {
      return h('div', { class: [className], attrs: { 'data-article': JSON.stringify({
        img: article.img || (article.mediaInfo && article.mediaInfo[0] && article.mediaInfo[0].img),
        title: article.title,
        author: article.author,
        id: article.id,
        viewNum: article.viewNum,
        replycnt: article.replycnt,
        cardEassyFlag: article.cardEassyFlag
      }), contenteditable: 'false' }}, [h(Item, { props,  on: {delete: del}})])
    },
  }).$mount()
  vm.remove = () => {
    const child = document.querySelector(`.${className}`)
    child.parentNode.removeChild(child)
  }
  return vm
}
