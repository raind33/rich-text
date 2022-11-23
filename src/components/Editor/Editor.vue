<template>
  <!-- v-loading.fullscreen="loading"
    :element-loading-text="loadingText" -->
  <div

    class="editor"
  >
    <!-- <button @click="getHtml">获取html</button>
    <button @click="setHtml">设置html</button> -->
    
    <div v-show="!isInputing && !titleCount && !hasArticleCard" :style="{ textAlign: align}" class="placeholder">请输入正文</div>
    <!-- @mouseleave="mouseLeave" -->
    <div
      id="editor-content"
      :style="{cursor: cursorStyle}"
      @keyup="setBack($event)"
    />
    <el-dialog :visible.sync="viewLinkDialog" :before-close="handleClose" class="squire-dialog-content" append-to-body>

      <div class="add-link">
        <el-form :model="linkForm">
          <el-form-item label="添加链接" class="link-title">
            <el-input v-model="linkForm.linkAddress" placeholder="请输入链接地址" />
          </el-form-item>
          <el-form-item label="链接文案">
            <el-input v-model="linkForm.linkWriting" type="textarea" autosize placeholder="请输入链接文案" />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewLinkDialog = false">取 消</el-button>
        <el-button type="primary" @click="insertLink">确 定</el-button>
      </div>
    </el-dialog>
    <InsertArticle :article="article" :visible.sync="visibleArticle" :getList="getArticleList" @delete="handleImgDelete" @change="selectArticle"></InsertArticle>
    <ImgUpload :img-list.sync="imgList"  :visible.sync="visibleImg" @submit="submitImg"/>
    <VideoUpload :visible.sync="visibleVideo" :file-selected="uploadVideo"/>
    <CollectArticle :link-content.sync="linkContent" :visible.sync="visibleCollectArticle" @submit="confirmLink"/>
    <input
      type="file"
      name="file"
      multiple
      class="upload-again-input hide"
      accept="image/*"
      @change="againImg"
    />
    <input
      type="file"
      name="file"
      class="replace-input hide"
      accept="image/*"
      @change="replaceImg"
    />
  </div>
</template>
<script>
/**
 * 示例：
 * <editor ref="editor" @backData="backData" />
 * this.$refs.editor.initData(data);
 * this.$refs.editor.getEditorData();
 */
// const lrz = require('lrz');
// 方式二

import util from '@haluo/util' // 局部引用
import InsertArticle from './insert-article/index.vue'
import ImgUpload from './img-upload/index.vue'
import VideoUpload from './video-upload/index.vue'
import CollectArticle from './collect-article/index.vue'
import { mountArticleDom } from './article-item/mount.js'
import car_ciose from '@/assets/img/tools/car_ciose@3x.png'
import '@/assets/js/squire-raw'
const cursorImg = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAYCAMAAACoeN87AAAAh1BMVEUAAAACAgL39/cICAgFBQUAAAADAwMKCgr6+vrn5+fr6+v6+voEBAT19fXm5ubf39+pqanBwcH8/PzOzs76+vrx8fHz8/P29vbh4eHm5ubT09OXl5f///9ZWVkiIiLIyMjGxsY+Pj5LS0uenp4vLy/V1dXk5OSsrKxnZ2eRkZF1dXXj4+ODg4P4y9kGAAAAHHRSTlMACMUDDQYOCuONi8MSt2tJMCryT9OpqKaRezobrP6h8wAAAR9JREFUKM+dk1lygzAMQOMtxoQlS/dKBrMn7f3PVwEFPND0I+/Dg8RD0mjM7nGEZoIOqfwc+0jTVE+RgcAcTQBvbFFOvM7zJvgcIw2uaKF0DuRS5LW1RBmKMQyhdugyMGJWGMciywrkauobZrY2kgxPQQCcFGIPFvb+sNGkSLUo3iDqEvPzqJz5IVF/KEnTIVak0IG35rJV1OFGr7AEKJHULh7KRKRE86gHLPKZAjnrkwEpgV4U6zEqEugRpL+TmXtVEGaQlO0sfK1sVnds7Pf/yim42q9FccjVai/q5WornKlsm4hVFRGX6NFlT7rPSlPb3GgxNnrmHvF7nxYh5A5dDaEaWzGf4TsGzpXQFsut2yDC37tr1O4eSurhD6CaPzWzJeCQ3tPtAAAAAElFTkSuQmCC) 28 10, text`
const keyToEditorMethod = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  size: 'setFontSize',
  color: 'setTextColour'
}
export default {
  name: 'Edit',
  components: {
    InsertArticle,
    ImgUpload,
    VideoUpload,
    CollectArticle
  },
  props: [
    'disabled',
    'isOss',
    'getEassyDetail',
    'getArticleList',
    'importEssay',
    'uploadImageByOther'
  ],
  data() {
    return {
      hasArticleCard: false,
      cursorStyle: 'auto',
      titleCount: 0, // 标题数量
      viewLinkDialog: false,
      linkForm: {
        linkAddress: '',
        linkWriting: '',
      },
      setAlignFlag: true,
      article: {}, // 插入的文章
      imgList: [],
      videoList: [],
      visibleVideo: false,
      visibleCollectArticle: false,
      visibleArticle: false, // 插入文章
      visibleImg: false, // 插入图片
      typeEnum: {
        '文字': '1',
        '图片': '2',
        '图文': '3',
        '段落标题': '4',
        '关联': '5', // 关联车辆、轨迹、活动、商家、话题
        '单视频': '6',
        '视频文字': '7',
        'URL': '8',
        '文章卡片': '11'
      },
      fontInfo: {
        size: ''
      },
      user: {}, // 用户
      editor: {}, // 编辑器实例对象
      editorDom: {}, // 编辑器Dom
      uploadStore: {}, // 待上传的图片池
      linkContent: '', // 插入链接的地址
      loadingText: '', // loaing的提示文字
      progressPercent: '', // 上传进度
      currentIndex: 0,
      loading: false, // 是否提交中
      viewStatus: false, // todo: 改名
      linkStatus: false, // todo: 改名
      styleStatus: {
        bold: false,
        italic: false,
        size: '',
        color: '',
        underline: false,
        title: false
      },
      contentLen: 0,
      imgCount: 0,
      backState: {
        redo: false,
        undo: false
      }
    };
  },
  computed: {
    align() {
      if (!this.isInputing && !this.titleCount && !this.hasArticleCard) {
        return this.getCursorAlignStyle() || 'left'
      }
      return 'left'
    },
    isInputing() {
      return this.contentLen > 0 || this.imgCount > 0
    }
  },
  watch: {
    progressPercent(val) {
      const inner = document.querySelector('.video-progress .inner')
      console.log(val, '视频上传进度')
      if (inner) {
        inner.style.width = val + '%'
        if (val === 100) {
          document.querySelector('.video-progress').innerHTML = `
            <div class="no-calc" style="text-align:center;color:#999999;font-size:18px;">正在获取视频封面</div>
          `
        }
      }
    },
    disabled: {
      handler(val) {
        if(val){
          this.editorDom.contentEditable = 'false'
        }
      },
      immediate: true
    }
  },
  created() {
    const me = this;
    me.user = JSON.parse(window.localStorage.getItem('user') || window.localStorage.getItem('userInfo') || '{}');
    me.guid = me.user.uid + '|' + util.tools.guid()
  },
  beforeDestroy() {
    this.editorDom && this.editorDom.removeEventListener('blur', this.canSetAlign)
  },
  mounted() {
    const me = this;
    me.editorDom = document.getElementById('editor-content');
    me.editorDom.addEventListener('blur', this.canSetAlign)
    if (!window.Squire) {
      me.initSquire();
    } else {
      me.initSquire();
    }
  },
  methods: {
    handleImgDelete() {
      this.updateData(true)
    },
    clearFormat() {
      this.editor.removeAllFormatting()
      this.updateData(true)
    },
    setCursor() {
      this.cursorStyle = this.cursorStyle === cursorImg ? 'auto' : cursorImg
      this.curStyle = {...this.styleStatus}
      this.editorDom.addEventListener('mouseup', this.handleCopyFormatUp)
    },
    handleCopyFormatUp() {
      const selection = this.editor.getSelection()
      if(!selection.collapsed) {
        this.editor.removeAllFormatting()
        Object.keys(this.curStyle).forEach(key => {
          if(this.curStyle[key]) {
            const method = keyToEditorMethod[key]
            method && this.editor[method](key === 'size' || key === 'color' ? this.curStyle[key] : undefined)
          }
        })
      }
      this.cursorStyle = 'auto'
      this.editorDom.removeEventListener('mouseup', this.handleCopyFormatUp)
    },
    updateData(flag) {
      const {
        contentLen,
        imgCount,
        titleCount
      } = this.getEditorData();
      this.contentLen = contentLen
      this.imgCount = imgCount
      this.titleCount = titleCount
      this.backState = this.editor.getUndoOrRedoState()
      this.$emit('backData', flag, contentLen, imgCount)
    },
    showUploadVideo() {
      this.visibleVideo = true
    },
    uploadVideo(e) {
      const files = e.target.files
      this.visibleVideo = false
      const fileName = (files[0] && files[0].name || '').toLowerCase();
      if (files[0].size > 1 * 1024 * 1024 * 1024) {
        return me.setToast('视频大小不能超过1GB');
      }
      if (fileName.indexOf('.mp4') === -1 && fileName.indexOf('.mov') === -1) {
        return me.setToast('视频格式不是mp4或mov');
      }
      const me = this;
      if (me.loading) return
      me.closeDialog();
      me.loading = true;
      this.editor['insertVideoProgress']()
      this.$emit('insertVideo', this, files, (result) => {
        const video = {
          duration: result.duration || '',
          link: result.videoUrl || '',
          img: me.coverUrl || result.coverUrl || '',
          id: result.videoId,
          desc: '',
          vodSize: result.vodSize || '', // 视频大小
          vodType: result.vodType || '', // 图片尺寸
        }
        me.$emit('updateAddVideo', true)
        me.editor['insertVideo'](result.videoUrl, video);
        me.updateData(true)
      }, (_) => {
        me.setMessageBoxNoCancel(_);
      }, () => {
        me.loading = false
        me.loadingText = ''
        me.removeProgress()
      })
    },
    replaceImg(e) {
      this.$emit('insertImgs', e.target.files, 'replace', (type, src) => {
        this.visibleImg = false
        this.imgUploadHandler(type, src)
      })
    },
    againImg(e) {
      this.$emit('insertImgs', e.target.files, 'uploadAgainImages', (type, src) => {
        this.visibleImg = false
        this.imgUploadHandler(type, src)
      })
    },
    handleClose() {
      this.linkForm.linkAddress = ''
      this.linkForm.linkWriting = ''
      this.viewLinkDialog = false
    },
    showLink() {
      this.viewLinkDialog = true
    },
    insertLink() {
      if (!this.linkForm.linkAddress) return this.$message.error('请输入链接地址')
      if (!this.linkForm.linkWriting) return this.$message.error('请输入链接文案')
      if (!this.validUrl(this.linkForm.linkAddress)) {
        return this.setToast('URL无效');
      }
      // this.editor.makeLink(this.linkForm.linkWriting, {
      //   href: this.linkForm.linkAddress
      // })
      this.editor.insertLink(this.linkForm.linkAddress, this.linkForm.linkWriting)
      this.updateData(true)
      this.viewLinkDialog = false
    },
    getHtml(type) {
      const html = this.editor.getHTML()
      const data = this.filterHtml(html, type)
      return data
    },
    generateImgHtml(img, isGif, desc) {
      let descHtml = ''
      if(desc) {
        descHtml = ` <div
                    class="content-explain"
                  >
                    <img src="../../assets/img/icon_tushuo@3x.png" alt />
                    <p>${desc}</p> 
                  </div>`
      }
      return `
      <div class="show-img-content">
                    <img
                      alt
                      src="${img}"
                      class="detail-imgs"
                      onerror="onerror=null;src='/static/img/web_img_zhanwei.png'"
                    />
                    ${ isGif ? '<div  class="is-gif">GIF</div>':''}
                  </div>
                 ${descHtml}
      `
    },
    generateLinkHtml(url, text) {
      return `
      <div class="url-mes">
                    <i></i>
                    <p>
                      <span :href="${url}">${text}</span>
                    </p>
                  </div>
      `
    },
    filterHtml(html, type) {
      const div = document.createElement('div')
      div.innerHTML = html
      const nodes = [...div.childNodes]
      nodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.classList.contains('halo-img-content')) {
            const children = [...node.childNodes]
            const img = node.querySelector('.halo-picture-area')
            const isGif = img.src.indexOf('.gif!nowater') > -1
            if (isGif) {
              img.src = img.src.replace('.gif!nowater', '.gif')
            }
            if(type === 'preview') {
              node.innerHTML = this.generateImgHtml(img.src, isGif, img.dataset.desc)
              return
            }
            children.forEach(child => {
              if (child.nodeType === 1 && !child.className.includes('halo')) {
                const parent = child.parentNode
                parent.removeChild(child)
              }
            })
          } else if (node.classList.contains('article-wrap')) {
            if(type === 'preview') return
            const id = JSON.parse(node.dataset.article).id
            const parent = node.parentNode
            const tag = document.createElement('halo-article')
            tag.dataset.article = JSON.stringify({ id })
            parent.replaceChild(tag, node)
          } else if (node.classList.contains('halo-video-content')) {
            node.removeChild(node.querySelector('.video-delete'))
          } else if (node.classList.contains('halo-link')) {
            if(type === 'preview') {
              const a = node.querySelector('.halo-link-mes')

              node.innerHTML = this.generateLinkHtml(a.dataset.url, a.innerText)
              return
            }
            const img = node.querySelector('.link-img')
            const del = node.querySelector('.img-delete')
            node.removeChild(img)
            node.removeChild(del)
          }
        }
      })
      return div.innerHTML
    },
    setHtml() {
      this.initData()
    },
    async parseHtml(html, essayPicRelVOList) {
      const div = document.createElement('div');
      div.innerHTML = html;
      const frag = document.createDocumentFragment()
      frag.appendChild(this.editor.empty(div))
      const nodes = [...frag.childNodes]
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (node.nodeType === 1) {
          if (node.tagName.toLowerCase() === 'halo-article') {
            await this.parseArticle(node)
          } else if (node.tagName.toLowerCase() === 'halo-good') {
            this.parseGood(node)
          } else if (node.classList.contains('halo-img-content')) {
            const img = node.querySelector('img')
            const desc = img.dataset.desc
            if(essayPicRelVOList) {
              const arr = img.src.split('/')
              const id = arr[arr.length - 1]
              img.src = essayPicRelVOList.find(obj => obj.id === String(id)).url
            }
            this.insertImgOperateBtns(this.editor, {
              content: desc
            }).forEach(child => {
              node.appendChild(child)
            })
          } else if (node.classList.contains('halo-video-content')) {
            this.parseVideo(node, essayPicRelVOList)
          } else if (node.classList.contains('halo-link')) {
            this.parseLink(node)
          }
        }
      }
      return frag
    },
    parseLink(node) {
      const img = this.editor.createElement('img', {
        class: 'link-img',
        src: '/static/img/icon_link@3x.png'
      })
      const del = this.generateDelLinkIcon()
      node.prepend(img)
      node.appendChild(del)
    },
    parseVideo(node, essayPicRelVOList) {
      const me = this
      const videoData = JSON.parse(node.dataset.video)
      
      const video = node.querySelector('.halo-video-area')
      const videoId = video.src
      const arr = videoId.split('/')
      const id = arr[arr.length - 1]
      video.src = essayPicRelVOList.find(obj => obj.id === String(id)).url
      videoData.link = video.src
      if(videoData.img) {
        const poster = essayPicRelVOList.find(obj => obj.id === videoData.img).url
        video.poster = poster
        videoData.img = poster
      }
      node.setAttribute('data-video', JSON.stringify(videoData))
      var delBtn = this.editor.createElement('i', {
        'class': 'pointer video-delete el-icon-error icon',
        'contenteditable': 'false',
      });
      delBtn.onclick = function(e) {
        me.removeParentByClass(e.target, 'halo-video-content')
        e.stopPropagation()
      }
      node.onclick = function() {
        me.setToast('不支持播放');
      }
      node.appendChild(delBtn)
    },
    async parseArticle(node) {
      const data = JSON.parse(node.dataset.article)
      await this.getEassyDetail(data.id, (info) => {
      const instance = mountArticleDom({
        article: info,
      }, () => {
          this.updateData(true)
        })
      const el = instance.$el
      const parent = node.parentNode
      parent.replaceChild(el, node)
      })
    },
    parseGood() {

    },
    setStyle(type) {
      this.editor[type]()
      this.updateData(true)
    },
    getCursorAlignStyle() {
      const selection = this.editor._lastSelection
      let activeAlign = ''
      if (selection) {
        let currentParagraph = selection.startContainer
        if (currentParagraph.tagName !== 'P') {
          currentParagraph = currentParagraph.parentNode
        }
        Array.from(currentParagraph.classList).forEach(item => {
          if (item.includes('align')) {
            activeAlign = item.split('-')[1]
          }
        })
      }
      return activeAlign
    },
    getCursorFontsize() {
      const selection = this.editor._lastSelection
      let activeAlign = ''
      if (selection) {
        let currentParagraph = selection.startContainer
        if (currentParagraph.tagName !== 'P') {
          currentParagraph = currentParagraph.parentNode
        }
        Array.from(currentParagraph.classList).forEach(item => {
          if (item.includes('align')) {
            activeAlign = item.split('-')[1]
          }
        })
      }
      return activeAlign
    },
    removeParentByClass(child, classname) {
      while (child) {
        if (child.classList.contains(classname)) {
          child.parentNode.removeChild(child)
          break
        }
        child = child.parentNode
      }
    },
    findParentByClass(child, classname) {
      while (child) {
        if (child.classList.contains(classname)) {
          return child
        }
        child = child.parentNode
      }
    },
    selectArticle(item) {
      const instance = mountArticleDom({
        article: item
      },  () => {
          this.updateData(true)
        })
      this.editor['insertArticle'](instance.$el)
      this.article = item
      this.visibleArticle = false
      this.hasArticleCard = true
      this.updateData(true)
    },
    editProgress() {

    },
    removeProgress() {
      const box = document.querySelector('.progress-wrap')
      const parentNode = box.parentNode
      parentNode.removeChild(box)
    },
    collectArticle() {
      this.visibleCollectArticle = true
    },
    uploadArticle() {
      this.visibleArticle = true
    },
    uploadImg() {
      this.visibleImg = true
      this.imgList = []
    },
    submitImg() {
      const files = this.imgList.map(item => item.file)
      this.$emit('insertImgs', files, 'img', (type, src) => {
        this.visibleImg = false
        this.imgUploadHandler(type, src)
      })
      
    },
    imgUploadHandler(type, imgSrc) {
      if (type && imgSrc) {
      // const id = uuidv4()
      // me.imgList.push({ id, src: imgSrc })
      if (type === 'uploadAgainImages') {
        // console.log('uploadAgainImages', me.currentImg, imgSrc);
        this.updateImage(imgSrc, this.currentImg)
        this.currentImg = ''
      } else {
        if (type === 'replace') {
          this.removePreviousImg && this.removePreviousImg()
          this.editor['insertImages'](imgSrc, {
            src: imgSrc,
            img: imgSrc,
            selected: false,
            type: '2'
          }, this.range);
        } else {
          this.editor['insertImages'](imgSrc, {
            src: imgSrc,
            img: imgSrc,
            selected: false,
            type: '2'
          });
        }
      }
      this.updateData(true)
    } else {
      this.setToast(rst.origin.name + '上传失败，请重试');
    }
    },
    insertImgOperateBtns(editor, data) {
      const me = this
      var replaceBtn = editor.createElement('div', {
          'class': 'img-replace pointer',
          'contenteditable': 'false',
        });
        var delBtn = editor.createElement('i', {
          'class': 'img-delete pointer el-icon-error icon',
          'contenteditable': 'false',
        });
        var descInput = editor.createElement('textarea', {
          'class': 'desc-input',
          maxlength: '50',
          rows: '2',
          cols: '50',
          placeholder: '请输入图片描述(最多50字)',
          'contenteditable': 'false',
        });
        descInput.disabled = me.disabled
        descInput.oninput = function(e) {
          const parent = me.findParentByClass(e.target, 'halo-img-content')
          const img = parent.querySelector('.halo-picture-area')
          img.dataset.desc = e.target.value
          if (e.target.value.length > 49) {
            return me.setToast('限制50个字符');
          }
        }
        descInput.value = data.content || ''
        var descInputWrap = editor.createElement('div', {
          'class': 'desc-input-wrap',
          'contenteditable': 'false',
        }, [descInput]);
        replaceBtn.onclick = function(e) {
          if(me.disabled) return
          // me.removeParentByClass(e.target, 'img-content')
          const current = me.findParentByClass(e.target, 'halo-img-content')
          const range = document.createRange()
          range.setEnd(current.previousElementSibling, 1)
          range.collapse(false)
          me.range = range
          const replaceInput = document.querySelector('.replace-input')
          me.removePreviousImg = () => me.removeParentByClass(e.target, 'halo-img-content')
          
          replaceInput.click()
        }
        delBtn.onclick = function(e) {
          if(me.disabled) return
          me.removeParentByClass(e.target, 'halo-img-content')
          me.updateData(true)
        }
        replaceBtn.innerHTML = '替换'
        return [replaceBtn, delBtn, descInputWrap]
    },
    // 初始化编辑器数据 displayData
    initData(data = '', essayPicRelVOList) {
      const html = `
        <h2 class="halo-paragraph-title">rwerwerwer<br></h2>
        <p class="halo-paragraph">23<b>42342</b>34<br></p>
        <ol>
          <li>233342<br></li>
          <li>23423<br></li>
        </ol>
        <p class="halo-paragraph"><br></p>
        <div class="halo-img-content" contenteditable="false"><img id=""
            src="http://imgs2.58moto.com/forum/20220909/3e44260d22404af8b3014487c9142871.jpeg!nowater?_516_1015"
            class="halo-picture-area"
            data="{&quot;src&quot;:&quot;http://imgs2.58moto.com/forum/20220909/3e44260d22404af8b3014487c9142871.jpeg!nowater?_516_1015&quot;,&quot;img&quot;:&quot;http://imgs2.58moto.com/forum/20220909/3e44260d22404af8b3014487c9142871.jpeg!nowater?_516_1015&quot;,&quot;selected&quot;:false,&quot;type&quot;:&quot;2&quot;}"
            data-content="" contenteditable="false" data-desc="232323"></div>
        <p class="halo-paragraph"><br></p>
        <p class="halo-paragraph"><br></p>
        <halo-article data-article="{&quot;id&quot;:5675033}"></halo-article>
        <p class="halo-paragraph"><br></p>
        <div class="halo-video-content" contenteditable="true"><video src="https://vod.58moto.com/sv/8ede13e-18335d700b6/8ede13e-18335d700b6.mp4" class="halo-video-area" controls="controls" data="{&quot;duration&quot;:&quot;&quot;,&quot;sourceVideoUrl&quot;:&quot;https://vod.58moto.com/sv/8ede13e-18335d700b6/8ede13e-18335d700b6.mp4&quot;,&quot;img&quot;:&quot;&quot;,&quot;id&quot;:&quot;68a5911627c74ba0bae9bc3b942307fe&quot;,&quot;selected&quot;:false,&quot;type&quot;:&quot;6&quot;,&quot;vodSize&quot;:&quot;&quot;,&quot;vodType&quot;:&quot;&quot;}" data-content="" poster=""></video></div>
        <p class="halo-paragraph"><br></p>
        <div class="halo-link" contenteditable="false"><a class="halo-link-mes" data-url="www.baidu.com" target="_blank">2323</a></div>
        <p class="halo-paragraph"><br></p>
        `
      this.parseHtml(data, essayPicRelVOList).then(res => {
        // 无法使用innerhtml，会导致绑定事件失效
        this.editorDom.innerHTML = ''
        this.editor.insertElement(res)
        this.updateData()
      })
    },
    // 设置富文本组件
    initSquire() {
      const me = this;
      const editorDom = me.editorDom;
      // Squire 自定义 paragraph 段落标签、paragraph-title 段落标题
      me.editor = new window.Squire(me.editorDom, {
        blockTag: 'p',
        blockAttributes: {
          'class': 'halo-paragraph',
        }
      });
      this.editor.addEventListener('pathChange', (obj) => {
        this.fontInfo = this.editor.getFontInfo()
        this.styleStatus.bold = this.editor.hasFormatTag('B')
        this.styleStatus.italic = this.editor.hasFormatTag('I')
        this.styleStatus.underline = this.editor.hasFormatTag('U')
        this.styleStatus.title = this.editor.hasFormatTag('H2')
        this.styleStatus.size = parseInt(this.fontInfo.size) === 100 ? 17:this.fontInfo.size
        this.styleStatus.color = this.fontInfo.color
      })
      
      me.editor.addEventListener('willPaste', function (type, handler) {
        function validateDom() {
          const fragment = type && type.fragment || {}
          // const textContent = fragment.textContent || ''
          let tmpNode = document.createElement('div')
          tmpNode.appendChild(fragment.cloneNode(true))
          const str = tmpNode.innerHTML
          // 含图片、视频、多段文字 禁止原始格式粘贴 || textContent.length > 200
          type.defaultPrevented = str.indexOf('<img') > -1 || str.indexOf('<video') > -1 || tmpNode.querySelectorAll('p').length > 1;
          tmpNode = null
        }
        validateDom()
        if (type.defaultPrevented) {
          me.getSticker(type, handler)
        }
      })
      window.Squire.prototype.makeParagraph = function (content, position, textAlign) {
        const className = textAlign ? `halo-paragraph align-${textAlign}` : 'halo-paragraph'
        let p = this.createElement('p', {
          'class': className
        })
        if (textAlign) {
          p.style['text-align'] = textAlign
        }
        if (position) {
          p = this.createElement('DIV', {
            'class': 'halo-paragraph',
            'contenteditable': 'true',
            'data-position': position,
          })
        }
        p.innerHTML = content
        this.insertElement(p)
      };
      window.Squire.prototype.makeHeader = function (content, config = { makeHeader: {}}) {
        console.log(content);
        if (content) {
          const h2 = this.createElement('h2', {
            'class': 'halo-paragraph-title',
          })
          h2.innerHTML = content
          this.insertElement(h2)
          
          return
        }
        let container
        this.modifyBlocks(function (frag) {
          var output = this._doc.createDocumentFragment();
          var block = frag;
          let dom
          const nodeName = block.firstChild && block.firstChild.nodeName;
          if ((nodeName === 'P' && (config.makeHeader.type === 0)) || (nodeName === 'H2' && (config.makeHeader.type === 1))) {
            dom = nodeName
          } else {
            dom = nodeName === 'H2' ? 'P' : 'H2';
          }
          const cla = dom === 'H2' ? 'halo-paragraph-title' : 'halo-paragraph';
          // eslint-disable-next-line no-cond-assign
          while (block = window.Squire.getNextBlock(block)) {
            container = this.createElement(dom, { 'class': cla }, [window.Squire.empty(block)])
            // debugger
            output.appendChild(
              // 段落才能添加标题
              Array.from(block.classList).indexOf('halo-img-content') > -1
                ? block
                : container
            );
          }
          
          return output;
        });
        const selection = window.getSelection()
        const range = document.createRange()
        console.log(container)
        range.setStart(container, 1)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      };
      window.Squire.prototype.insertImages = function (src, data = {}, range) {
        // 1、不处理已上传失败情况了  2、每次粘贴或缓存获取，重新计算待上传图片
        var isHaloImage = me.isHaloImage(src)
        var scrollTop = document.documentElement.scrollTop;

        // todowh 撤回记录滚动位置
        var loading = this.createElement('div', {
          'class': 'img-loading',
          'contenteditable': 'false'
        })
        loading.innerHTML = `
          <img class="img-loading-icon" src="/static/img/upload-image-loading.png"/>
          <span class="img-loading-tip">上传中...</span>
        `
        var fail = this.createElement('div', {
          'class': 'img-fail hide',
          'contenteditable': 'false'
        })
        fail.innerHTML = '上传失败<br>请下载图片至本地后重新上传'
        var again = this.createElement('button', {
          'class': 'img-again hide',
          'contenteditable': 'false',
        });
        again.innerHTML = '重新上传'

        // var onerror = 'onerror=null;src="/static/img/web_img_zhanwei.png"';
        const isGif = src && src.indexOf('.gif') > -1
        if (isGif) {
          src = src.replace('.gif', '.gif!nowater')
        }
        var img = this.createElement('img', {
          'id': isHaloImage ? '' : src,
          'src': src,
          'class': isHaloImage ? 'halo-picture-area' : 'halo-picture-area no-upload',
          'data': JSON.stringify(data),
          'data-content': data.content || '',
          'contenteditable': 'false',
        });
        const btns = me.insertImgOperateBtns(this, data)
        var childList = []
        childList.push(img)
        childList.push(...btns)
        !isHaloImage && childList.push(loading)
        !isHaloImage && childList.push(fail)
        !isHaloImage && childList.push(again)
        var p = this.createElement('div', {
          'class': 'halo-img-content',
          'contenteditable': 'false'
        }, [...childList]);
        this.insertElement(p, range);
        setTimeout(() => { document.documentElement.scrollTop = scrollTop; }, 50);
      };
      window.Squire.prototype.insertVideoProgress = function() {
        const div = this.createElement('DIV', {
          'class': 'progress-wrap'
        })
        div.innerHTML = `
          <div class="video-progress">
            <div class="label">上传中...</div>
            <div class="box">
              <div class="inner" style="width:20%"></div>
            </div>
          </div>
        `
        this.insertElement(div);
      }
      window.Squire.prototype.insertArticle = function(dom) {
        this.insertElement(dom)
      }
      window.Squire.prototype.insertRiding = function (dom) {
         this.insertElement(dom)
      };
      window.Squire.prototype.insertVideo = function (src, data = {}) {
        var scrollTop = document.documentElement.scrollTop;
        var video = this.createElement('VIDEO', {
          'src': src,
          'class': 'halo-video-area',
          'controls': 'controls',
          'data': JSON.stringify(data),
          'data-content': data.content || '',
          'poster': data.img || '',
          // 'contenteditable': 'true',
        });
        var delBtn = this.createElement('i', {
          'class': 'pointer video-delete el-icon-error icon',
          'contenteditable': 'false',
        });
        delBtn.onclick = function(e) {
          me.removeParentByClass(e.target, 'halo-video-content')
          e.stopPropagation()
        }
        var p = this.createElement('DIV', {
          'class': 'halo-video-content',
          'contenteditable': 'true',
          'data-video': JSON.stringify(data),
        }, [video, delBtn]);
        p.onclick = function() {
          me.setToast('不支持播放');
        }
        this.insertElement(p);
        setTimeout(() => { document.documentElement.scrollTop = scrollTop; }, 100);
      };
      window.Squire.prototype.insertLink = function (link, text) {
        var scrollTop = document.documentElement.scrollTop;
        var img = `<img class="link-img" src='/static/img/icon_link@3x.png'></img>`;
        var a = `<a class="halo-link-mes"  data-url="${link}" target="_blank">${text}</a>`
        const del = me.generateDelLinkIcon()
        var p = this.createElement('DIV', {
          'class': 'halo-link',
          'contenteditable': 'false'
        });
        p.innerHTML = img + a;
        p.appendChild(del)
        this.insertElement(p);
        setTimeout(() => { document.documentElement.scrollTop = scrollTop; }, 50);
      };
      me.sticky();
      
    },
    generateDelLinkIcon() {
      const me = this
      const del = this.editor.createElement('img', {
        'class': 'img-delete',
        'contenteditable': 'false',
        'src': car_ciose
      });
      del.onclick = function(e) {
        const parent = me.findParentByClass(e.target, 'halo-link')
        parent.remove()
      }
      return del
    },
    // 转换数据，返回给业务
    getEditorData() {
      const me = this;
      const children = Array.from(me.editorDom.children);
      let isNotParagraph = true;
      let count = 0
      let imgCount = 0
      let title = 0
      let videoIds = []
      let hasFailUploadImg = false
      let cardEassyFlagStatus = false
      this.hasArticleCard = false
      children.map(function (value, index) {
        if (value.tagName === 'H2' && value.innerText.length) { // 段落标题
          isNotParagraph = false
          title += value.innerText.length
        } else if (value.className.includes('article-wrap')) {
          const article = JSON.parse(value.dataset.article)
          cardEassyFlagStatus = !!article.cardEassyFlag
          me.hasArticleCard = true
        } else if (value.className.includes('halo-paragraph') || value.tagName === 'OL' || value.tagName === 'UL') { // 文字
          const text = value.innerText && value.innerText.trim()
          if (text.length < 1) { return }
          count += text.replace(/\n/g, '').length
          isNotParagraph = false
        } else if (value.className === 'halo-img-content') { // 图文
          const img = value.querySelector('.halo-picture-area');
          isNotParagraph = false
          if (img.src.indexOf('jddmoto') === -1 && img.src.indexOf('58moto') === -1) {
            hasFailUploadImg = true
            return
          }
          imgCount += 1
        } else if (value.className === 'halo-video-content') { // 视频
          const id = JSON.parse(value.dataset.video).id
          videoIds.push(id)
          isNotParagraph = false
        } else if (value.className === 'halo-link') { // 外链
          isNotParagraph = false
        } else {
          // 默认文字
          if (value.innerText.length < 1) { return }
          isNotParagraph = false
        }
      });
      return {
        isNotParagraph,
        hasFailUploadImg,
        contentLen: count,
        imgCount: imgCount,
        titleCount: title,
        cardEassyFlagStatus,
        videoIds
      }
    },
    
    // 是否是哈罗摩托的图片
    isHaloImage(url = '') {
      return url.indexOf('jddmoto.com') > -1 || url.indexOf('58moto.com') > -1
    },
    // 获取待上传图片列表
    updateUploads() {
      const me = this
      setTimeout(() => {
        const uploads = document.querySelectorAll('.no-upload') || []
        me.uploadStore = {}
        me.currentIndex = 0

        Array.from(uploads).map((_, index) => {
          const id = _.getAttribute('id')
          const key = index + '|' + id
          me.uploadStore[key] = _ // 1 no-upload 2 upload-fail
        })
        me.uploadImageHandler()
      }, 500);
    },
    uploadImageHandler(key = '') {
      const me = this
      const list = Object.keys(me.uploadStore) // 待上传图片集合

      if (!list.length || me.currentIndex > list.length) return

      const one = 1
      const two = 2
      const three = 3
      const moreImage = list.length > three

      // 多张图片，每三张并发上传
      if (me.currentIndex) { // 1、非首次上传
        if (moreImage) {
          // 接力第一、二、三线程池
          me.uploadImage(key).then(_ => me.uploadImageHandler(list[me.currentIndex++]))
        }
      } else { // 2、首次上传
        // 第一个线程池
        me.uploadImage(list[0]).then(_ => me.uploadImageHandler(list[me.currentIndex++]))
        // 第二个线程池
        list.length > one && me.uploadImage(list[one]).then(_ => me.uploadImageHandler(list[me.currentIndex++]))
        // 第三个线程池
        list.length > two && me.uploadImage(list[two]).then(_ => moreImage && me.uploadImageHandler(list[me.currentIndex++]))
        me.currentIndex = three // 更新上传位置
      }
    },
    uploadImage(key = '') {
      const me = this
      const itemId = me.guid || ''
      const currentImg = me.uploadStore[key]
      const imageUrl = key.split('|')[1] || ''

      if (!currentImg) {
        console.log('图片不存在', key)
        return Promise.reject('图片不存在')
      }

      const parent = currentImg.parentNode || ''
      const uploadFailHandler = (currentImg) => {
        currentImg.className = 'halo-picture-area upload-fail'

        const imgLoading = parent.querySelector('.img-loading')
        imgLoading && (imgLoading.className = 'img-loading hide')
        const imgReplace = parent.querySelector('.img-replace')
        const input = parent.querySelector('.desc-input-wrap')
        imgReplace && parent.removeChild(imgReplace)
        input && parent.removeChild(input)
        const imgFail = parent.querySelector('.img-fail')
        imgFail && (imgFail.className = 'img-fail')
        const imgAgain = parent.querySelector('.img-again')
        if (imgAgain) {
          imgAgain.className = 'img-again'
          imgAgain.onclick = function (e) {
            me.currentImg = currentImg
            const upload = document.querySelector('.upload-again-input')
            upload && upload.click()
          }
        }
      }
      return this.uploadImageByOther({
        itemId,
        imageUrl,
        businessId: 2,
      }).then(_ => {
        // https://mp.weixin.qq.com/s?__biz=MjM5NzY4MzQyMQ%3D%3D&chksm=bed7fa9e89a07388f045b67d3749aa94e9df2dae8ebdae57efa5956bfa4b9b7554538beec7a6&idx=1&mid=2650084140&scene=0&sn=0fbf85ba93be4e226304be2df10b3ea6#rd
        // && imageUrl !== 'https://mmbiz.qpic.cn/mmbiz_gif/lxslyr6ibEMsfJRVAPrYkTX5ibNCWvZlfbXgH2NRR4esGTdQGzvibVbnkqAHibSviaC6nIEAibm9Ke9Ipa6tnAu8xc8w/640?wx_fmt=gif'
        if (_.data.code === 0 && _.data.data) {
          const img = _.data.data.thirdPartyImageUrl
          me.updateImage(img, currentImg)
        } else {
          parent && uploadFailHandler(currentImg)
        }
        if (Object.keys(me.uploadStore).length === (Number(key.split('|')[0] || '') + 1)) { // 上传为最后一张时，更新数据
          setTimeout(() => {
            me.updateData(true)
          }, 100);
        }
      }).catch(e => {
        console.log(e)
        parent && uploadFailHandler(currentImg)
      })
    },
    // 更新上传的图片
    updateImage(img, currentImg = {}) {
      const data = JSON.parse(currentImg.getAttribute('data') || '{}')
      data.img = img

      currentImg.setAttribute('src', img)
      currentImg.setAttribute('data', JSON.stringify(data))
      currentImg.className = 'halo-picture-area'

      const parent = currentImg.parentNode || ''
      // debugger
      const loading = parent.querySelector('.img-loading')
      const imgFail = parent.querySelector('.img-fail')
      const imgAgain = parent.querySelector('.img-again')
      loading && parent.removeChild(loading)
      imgFail && parent.removeChild(imgFail)
      imgAgain && parent.removeChild(imgAgain)
      const desc = parent.querySelector('.desc-input-wrap')
      if (!desc) {
        const arr = this.insertImgOperateBtns(this.editor, {})
        parent.appendChild(arr[0])
        parent.appendChild(arr[2])
      }
      // parent && (parent.innerHTML = currentImg.outerHTML)
    },
    // 获取ctrl + v 后内容
    getSticker(type, handler) {
      this.setSticker(type.fragment.children)
    },
    // 粘贴
    setSticker(data) {
      const me = this;
      data = Array.from(data)
      // debugger
      data.map(function (value, index) { // 其他标签时，需要针对嵌套标签做截取
        const htmlArr = (value.innerHTML || value.outerHTML) // 剪切图片用到 value.outerHTML
          .replace(/<img(.*?)src="(.*?)"(.*?)>/g, '(delimiter)[img src=$2](delimiter)')
          .replace(/<img(.*?)src='(.*?)'(.*?)>/g, '(delimiter)[img src=$2](delimiter)')
          .replace(/<a href="(.*?)"(.*?)>(.*?)<\/a>/g, '(delimiter)$3(delimiter)')
          .replace(/<p (.*?)>(.*?)<\/p>/g, '(delimiter)$2(delimiter)')
          .replace(/<\/?.+?>/g, '') // 截取出img、link 和文字部分，使用(delimiter) 切割
          .split('(delimiter)') // 拆分成数组，完成替换
        htmlArr.map(function (nValue) {
          if (!nValue || nValue === '&nbsp;') {
            return
          }
          if (nValue.indexOf('[img') > -1) { // 图片
            const src = nValue.replace(/\[img src=(.*?)\]/g, '$1').replace(/amp;/g, '')
            me.editor.insertImages(src, {
              src,
              img: src,
              selected: false,
              type: '2'
            })
          } else { // 文字
            me.editor.makeParagraph(nValue)
          }
        })
      })

      me.updateUploads()
      this.updateData(true)
    },
    mouseLeave() {
      const me = this;
      me.updateData()
    },
    // 监测 添加、撤回、恢复、删除
    setBack(e, type) {
      const me = this;
      me.refreshImg()
      me.updateData(true)
    },
    refreshImg() {
      Array.from(document.querySelectorAll('.halo-img-content')).map((_ = {}) => {
        var target = _.querySelector('.halo-picture-area');
        var tag = null
        if (target.classList.contains('upload-fail')) {
          tag = _.querySelector('.img-again')
        } else {
          tag = _.querySelector('.desc-input')
        }
        if (!target || !tag) {
          if (_.parentNode) {
            _.parentNode.removeChild(_);
          }
        }
        //
      })

      Array.from(document.querySelectorAll('.article-wrap')).map((_ = {}) => {
        var target = _.querySelector('.icon');
        if (!target) {
          if (_.parentNode) {
            _.parentNode.removeChild(_);
          }
        }
        //
      })
    },
    // 设置scoll
    sticky() {
      const me = this;
      me.$nextTick(function () {
        const sticky = document.querySelector('.tool-box');
        if (!sticky) { return }
        const origOffsetY = sticky.offsetTop;
        function onScroll(e) {
          if (location.href.indexOf('/detail') === -1) {
            document.removeEventListener('scroll', onScroll);
            return;
          }
          window.scrollY >= origOffsetY + 160 ? sticky.classList.add('fixed-top') : sticky.classList.remove('fixed-top');
        }
        document.removeEventListener('scroll', onScroll);
        document.addEventListener('scroll', onScroll);
      });
    },
    // ==========toolbox==========
    // 撤回、恢复、段落标题
    setContent(e, obj) {
      const me = this;
      const id = e.target.id || e.target.dataset.editorId
      const value = '';
      if (id && me.editor && me.editor[id]) {
        me.editor[id](value, obj);
        me.updateData(true);
      }
    },
    canSetAlign() {
      const editor = this.editor
      if (editor) {
        const selection = editor.getSelection()
        const container = selection.startContainer
        if (container.parentNode && container.parentNode.classList.contains('halo-paragraph-title')) {
          this.setAlignFlag = false
          return
        }
        if (container && container.classList && container.classList.contains('halo-paragraph-title')) {
          this.setAlignFlag = false
          return
        }
        this.setAlignFlag = true
      }
    },
    setAlign(e, align) {
      const id = e.target.dataset.editorId
      if (id && this.editor && this.editor[id]) {
        this.editor[id](align);
        this.updateData(true)
      }
    },
    setColor(val) {
      this.editor['setTextColour'](val);
      this.updateData(true)
    },
    setFontSize(e, size) {
      this.editor['setFontSize'](size);
      this.fontInfo = this.editor.getFontInfo()
      this.updateData(true)
    },
    // 增加link
    addLink(type) {
      const me = this;
      me.linkTitleName = type === 'link' ? '添加链接' : '添加导入链接地址';
      me.linkPlaceholder = type === 'link' ? '请输入链接地址' : '仅支持输入微信链接';
      me.viewStatus = true;
      me.linkStatus = true;
    },
    validUrl(url) {
      const objExp = /^(((ht|f)tp(s?)):\/\/)?(www.|[a-zA-Z].)[a-zA-Z0-9-.]+.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk|cn|im)(:[0-9]+)*(\/($|[a-zA-Z0-9.,;?'&%$#=~_-]+))*$/;
      return objExp.test(url)
    },
    // 确认增加link
    confirmLink() {
      const me = this;
      if (!me.linkContent) {
        return this.$message.error('请输入链接地址！');
      }
      if (me.linkTitleName === '添加导入链接地址' || this.visibleCollectArticle) {
        this.visibleCollectArticle = false
        return me.importLinkData(); // 一键导入功能单独处理
      }
      if (!this.validUrl(me.linkContent)) {
        return me.setToast('URL无效');
      }
      if (me.linkContent.indexOf('jddmoto.com') === -1 && me.linkContent.indexOf('58moto.com') === -1) {
        return me.setToast('请输入哈罗摩托内部网址');
      }
      me.editor['insertLink'](me.linkContent);
      me.linkContent = '';
      me.closeDialog();
    },
     // 增加link导入数据
     importLinkData() {
      const me = this;
      if (me.loading) {
        return this.$message('正在获取信息，请稍后...')
      }
      me.loading = true;
      const params = {
        action: me.isOss ? '30008OSS': 30008,
        url: me.linkContent
      }
      if(!me.isOss) {
        params.autherid = me.user.uid
      }
      this.importEssay(params).then(response => {
        console.log(response);
        if (response.status === 200 && response.data) {
          const data = JSON.parse(response.data || '{}');
          data.data.content = data.data.content.replace(/<a href="(.*?)"(.*?)>/g, '').replace(/<\/a>/g, '').replace(/<iframe([^<>]*)>([^<>]*)<\/iframe>/g, '').replace(/<video([^<>]*)>([^<>]*)<\/video>/g, '');
          // 运营需求，删除a标签（不删除内容），删除video、iframe 标签
          const importContent = document.createElement('div')
          importContent.innerHTML = data.data.content;
          me.setSticker(importContent.children); // 重新走粘贴方法
          me.closeDialog();
          me.linkContent = '';
          return
        } else {
          me.setToast('导入失败，请重试');
        }
      }).catch((err) => {
        console.log(err.message);
        me.setToast('导入异常，请重试');
      }).finally(_ => {
        me.loading = false;
      });
    },
    // 打开 图片、视频、一键导入 弹框
    openDialog(name) {
      const me = this;
      me.viewName = name === 'img' ? '添加图片' : '添加视频';
      me.viewButton = name === 'img' ? '选择图片' : '选择视频';
      me.viewTip = name === 'img' ? '' : '为了获得更高的推荐和点击量，建议上传720p(1280*720)，大小不超过500MB(视频上传需要时间，请耐心等待)';
      me.viewStatus = true;
    },
    // 关闭弹框
    closeDialog() {
      this.viewStatus = false;
      this.linkStatus = false;
      this.linkContent = '';
    },
    // ==========toolbox end==========
    // 弹框提示
    setToast(content) {
      this.$message.error(content);
    },
    setMessageBoxNoCancel(content) {
      this.$confirm(content, '', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          
        }).catch(() => {
                    
        });
    }
  },
  beforeRouteLeave(to, from, next) {
    next();
  }
};
</script>
<style lang='less'>
@import "editor.less";
</style>
