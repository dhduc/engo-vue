<template>
  <el-dialog
    :visible="isShowPostData"
    :close-on-click-modal="false"
    :show-close="isClose"
    :title="title"
    append-to-body
    center
    class="dialog-post eg-dialog"
    @close="cancelPostData"
  >
    <div class="progress-box">
      <el-progress :percentage="percentage | floor" color="#5cb87a" type="circle" />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button v-if="isDone" type="primary" @click="startTopic">Kiểm tra</el-button>
      <!--<el-button v-else type="default" @click="cancelPostData">Hủy</el-button>-->
    </div>
  </el-dialog>
</template>

<script>
import axios from 'axios'
import { apiError } from '../functions/index'
const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export default {
  name: 'PostModal',
  props: {
    isShowPostData: {
      type: Boolean
    },
    saveApi: {
        type: String
    },
    topicId: {
      type: Number
    },
    topicURL: {
      type: String
    },
    words: {
      type: Array
    },
    sentences: {
      type: Array
    },
    saveResult: {
      type: Boolean
    }
  },
  filters: {
      floor(val) {
          return Math.floor(val)
      }
  },
  data() {
    return {
      title: 'Bắt đầu tạo danh sách từ vựng',
      isClose: false,
      loading: false,
      percentage: 0,
      isDone: false,
      saveVocabApi: '/vocab/api/saveVocab'
    }
  },
  async created() {
    if (this.words.length > 0) {
        await this.submitData().then(async () => {
            this.percentage = 100
            this.isDone = true
            this.isClose = true
        }).catch((error) => {
            console.log('error', error);
            apiError('Không thể lưu từ vựng')
        })
    }
  },
  methods: {
    async submitData() {
      const words = this.words.filter(elm => elm.check === true)
      const step = 100 / (words.length)
      await asyncForEach(words, async (word) => {
          const sentence = this.sentences.find((v) => v.includes(word.en))
          await axios.post(this.saveApi, {
            topic: this.topicId,
            word: word.en,
            example: sentence
          })
          .then(() => {
            this.percentage += step
          })
          .catch(() => {
            apiError(`Từ vựng ${word.en} không thể được thêm vào!`);
          });
      })
    },
    onSaveVocab() {
        let words = this.words.filter(word => word.check === false)
        const data = words.map(word => word.en.toLowerCase())
        if (words.length) {
            axios
            .post(this.saveVocabApi, {
                words: data
            })
            .catch(() => {
                console.log('[Vocab] save failed!')
            })
        }
    },
    cancelPostData() {
      this.$emit('closePostData')
    },
    startTopic() {
      window.location.href = '/'
    }
  }
}
</script>

<style scoped>
.dialog-post .progress-box {
  text-align: center;
}
.dialog-post .text-center {
  font-size: 16px;
  font-weight: 400;
}
</style>
