<template>
  <el-dialog
    v-loading="loading"
    :visible="visible"
    :close-on-click-modal="false"
    title="Bổ sung từ vựng"
    width="70%"
    custom-class="import-dialog"
    @close="cancelDialog"
  >
    <el-form v-if="!preview" :model="formData" :ref="formName" :rules="rules" label-position="top">
      <el-form-item label="Nhập nội dung vào đây:" prop="content" required>
        <el-input
          v-if="!preview"
          :autosize="{ minRows: 15, maxRows: 100}"
          v-model.trim="formData.content"
          type="textarea"
          resize="none"
          placeholder="Word 1, Từ vựng 1, Example 1
Word 2, Từ vựng 2, Example 2
Word 3, Từ vựng 3, Example 3"
        />
      </el-form-item>

      <el-form-item label="Phân tách giữa word, từ vựng, example bằng:" class="inline" required>
        <el-radio-group v-model="formData.split">
          <el-radio :label="comma">Dấu phẩy</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Phân tách các thẻ từ vựng bởi:" class="inline" required>
        <el-radio-group v-model="formData.between">
          <el-radio :label="new_line">Xuống dòng</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item class="button-dialog">
        <el-button icon="el-icon-s-promotion" :disabled="formData.content.length === 0" type="primary" @click="handlePreview()">Lựa chọn</el-button>
        <el-button @click="cancelDialog">Hủy</el-button>
      </el-form-item>
    </el-form>

    <div v-else class="preview">
      <h2 class="content label">Danh sách: <span>{{ cards.length }} từ vựng</span></h2>
      <el-tag
        v-for="(card, index) in cards"
        :key="index"
        :disable-transitions="false"
        type=""
        effect="dark"
        closable
        class="item"
        @close="handleClose(card)"
      >
        {{ card.en + ': ' + card.vi }}
      </el-tag>
      <div class="footer">
        <el-button icon="el-icon-s-promotion" :disabled="cards.length === 0" type="primary" @click="submitForm()">Thực hiện</el-button>
        <el-button @click="closePreview">Đặt lại</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import axios from 'axios'
import { apiSuccess, apiError } from '../functions/index'

const COMMA = 'comma'
const NEW_LINE = 'new_line'

export default {
  name: 'ImportModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    topicId: {
      type: Number,
      default: 0
    },
    importApi: {
        type: String
    }
  },
  data() {
    return {
      loading: false,
      formName: 'import-word',
      rules: {
        content: [
          {
            required: true,
            trigger: ['blur', 'change'],
            message: 'Yêu cầu bắt buộc!'
          }
        ]
      },
      formData: {
        content: '',
        split: COMMA,
        between: NEW_LINE
      },
      comma: COMMA,
      new_line: NEW_LINE,
      cards: [],
      preview: false
    }
  },

  computed: {
  },

  created() {
  },

  methods: {
    handlePreview() {
      this.$refs[this.formName].validate((valid) => {
        if (valid) {
          const content = this.formData.content
          let cards = content.split('\n')

          cards = cards.filter((v) => v.length > 0)
          cards = [...new Set(cards)]
          cards = cards.map((card) => {
            const data = card.split(',')
            return {
              en: data[0] || 'N/A',
              vi: data[1] || 'N/A',
              example: data[2] || ''
            }
          })
          cards = cards.filter((v) => v)

          this.cards = cards
          this.preview = true
        }
      })
    },
    closePreview() {
      this.cards = []
      this.preview = false
    },
    handleClose(card) {
      this.cards.splice(this.cards.indexOf(card), 1)
    },
    cancelDialog() {
      this.$emit('cancelDialog')
    },
    submitForm() {
      this.loading = true
      axios.post(this.importApi, {
        topicId: this.topicId,
        cards: this.cards
      }).then(() => {
         apiSuccess('Từ vựng đã được thêm vào!');
         this.cancelDialog();
         this.$emit('loadCards')
      }).catch(() => {
        apiError('Không thể thêm từ vựng')
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
  .import-dialog .inline {
    width: 50%;
    margin: 0;
    float: left;
    margin-bottom: 30px;
  }
  .import-dialog .preview {
    margin-bottom: 20px;
  }
  .import-dialog .footer {
    margin-top: 50px;
  }
  .import-dialog .item {
    margin-right: 10px;
  }
  .import-dialog .el-tag {
    font-size: 1rem;
  }
</style>
