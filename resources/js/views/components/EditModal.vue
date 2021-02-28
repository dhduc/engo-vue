<template>
    <el-dialog
            :visible="visible"
            :close-on-click-modal="false"
            title="Thay đổi từ vựng"
            class="eg-dialog"
            append-to-body
            @close="cancelDialog">
        <div v-loading="loading" class="load-modal">
            <el-form ref="formData" :model="form" label-width="120px" class="form" label-position="top">
                <el-form-item label="Từ vựng">
                    <el-input v-model="form.en" maxlength="255"></el-input>
                </el-form-item>
                <el-form-item label="Ý nghĩa">
                    <el-input v-model="form.vi" maxlength="255"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm('formData')">Thực hiện</el-button>
                <el-button @click="cancelDialog">Hủy</el-button>
            </span>
        </div>
    </el-dialog>
</template>

<script>
    import axios from 'axios'
    import { apiError } from '../functions/index'

    export default {
        name: 'EditModal',
        props: {
            visible: {
                type: Boolean,
            },
            wordId: {
                type: Number
            },
            word: {
                type: Object
            },
            updateApi: {
                type: String
            }
        },
        filters: {
        },
        data () {
            return {
                form: {},
                loading: false
            }
        },
        created() {
            this.form = this.word
        },
        computed: {
        },
        methods: {
            submitForm() {
                Promise.all([
                    this.updateEn(),
                    this.updateVn()
                ]).then(() => {
                    this.$emit('saveWord', this.form)
                })
                .catch(() => {
                    apiError('Không thể thay đổi từ vựng')
                })
                .finally(() => {
                    this.cancelDialog()
                })
            },
            updateEn() {
                axios.post(this.updateApi, {
                        id: this.wordId,
                        field: 'en',
                        value: this.form.en
                    })
            },
            updateVn() {
                axios.post(this.updateApi, {
                        id: this.wordId,
                        field: 'vi',
                        value: this.form.vi
                    })
            },
            cancelDialog() {
                this.$emit('cancelEditDialog')
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