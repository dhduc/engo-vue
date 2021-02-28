<template>
    <el-dialog
            :visible="visible"
            :close-on-click-modal="false"
            title="Tạo mới từ vựng"
            class="eg-dialog"
            append-to-body
            @close="cancelDialog">
        <div v-loading="loading" class="load-modal">
            <el-form ref="formData" :rules="rules" :model="form" label-width="100px" class="form">
                <el-form-item label="Từ vựng" prop="en">
                    <el-input v-model="form.en" placeholder="word" maxlength="255" style="width: 50%" show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="Ý nghĩa" prop="vi">
                    <el-input v-model="form.vi" placeholder="chữ" maxlength="255" style="width: 50%" show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="Từ loại" prop="type">
                    <el-input v-model="form.type" placeholder="noun" maxlength="50" style="width: 50%" show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="Phát âm" prop="phonetic">
                    <el-input v-model="form.phonetic" placeholder="wərd" maxlength="255" style="width: 50%" show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="Mô tả" prop="definition">
                    <el-input v-model="form.definition" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="Ví dụ" prop="example">
                    <el-input v-model="form.example" placeholder=""></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button :loading="loading" type="primary" @click="submitForm('formData')">Thực hiện</el-button>
                <el-button @click="cancelDialog">Hủy</el-button>
            </span>
        </div>
    </el-dialog>
</template>

<script>
    import axios from 'axios'
    import { apiSuccess, apiError } from '../functions/index'

    const DEFAULT_FORM = {
        en: '',
        vi: '',
        type: '',
        phonetic: '',
        definition: '',
        example: '',
    }

    export default {
        name: 'CreateModal',
        props: {
            visible: {
                type: Boolean,
            },
            topicId: {
                type: Number
            },
            createApi: {
                type: String
            }
        },
        filters: {
        },
        data () {
            return {
                form: DEFAULT_FORM,
                rules: {
                  en: [
                    { required: true, message: 'Bắt buộc', trigger: ['blur', 'change'] },
                    { max: 255, message: 'Tối đa 255 kí tự', trigger: ['blur', 'change'] }
                  ],
                  vi: [
                    { required: true, message: 'Bắt buộc', trigger: ['blur', 'change'] },
                    { max: 255, message: 'Tối đa 255 kí tự', trigger: ['blur', 'change'] }
                  ],
                  type: [
                    { max: 50, message: 'Tối đa 50 kí tự', trigger: ['blur', 'change'] }
                  ],
                  phonetic: [
                    { max: 255, message: 'Tối đa 255 kí tự', trigger: ['blur', 'change'] }
                  ]
                },
                loading: false
            }
        },
        created() {
            this.form.topic_id = this.topicId
        },
        computed: {
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.loading = true
                        axios.post(this.createApi, this.form)
                            .then(() => {
                                this.form = DEFAULT_FORM
                                this.loading = true
                                apiSuccess('Từ vựng đã được thêm vào!');
//                                this.$emit('createWord')
                            })
                            .catch(() => {
                                apiError('Không thể thêm từ vựng')
                            })
                    } else {
                        return false;
                    }
                });
            },
            cancelDialog() {
                this.$emit('cancelCreateCard')
                this.$refs['formData'].resetFields()
            },
        }
    }
</script>
<style>
    .load-modal .el-radio__label {
        white-space: normal;
    }
</style>