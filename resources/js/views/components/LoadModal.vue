<template>
    <el-dialog
            :visible="visible"
            :close-on-click-modal="false"
            :title="fieldText(field) + word"
            class="eg-dialog"
            append-to-body
            @close="cancelDialog">
        <div v-loading="loading" class="load-modal">
            <el-form ref="formData" :model="form" label-width="0px" class="form">
                <el-form-item v-show="isDefinition">
                    <el-radio-group v-model="define">
                        <div v-for="(definition, type) in definitions" :key="type">
                            <div v-for="(item, key) in definition" :key="type + key">
                                <el-radio name="definition" :label="type + key" @change="changeWord(type, item.definition)">
                                    <em>({{ type }})</em> {{ item.definition }}
                                </el-radio>
                            </div>
                        </div>
                    </el-radio-group>
                    <el-input v-model="form.definition"></el-input>
                </el-form-item>
                <el-form-item v-show="isExample">
                    <el-radio-group v-if="examples.length" v-model="form.example">
                        <div v-for="(example, index) in examples" :key="index">
                            <el-radio :label="example">
                                {{ example }}
                            </el-radio>
                        </div>
                    </el-radio-group>
                    <el-input v-model="form.example"></el-input>
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
    import {DEFINITION, EXAMPLE} from '../constants/index'
    import { apiError } from '../functions/index'

    export default {
        name: 'LoadModal',
        props: {
            visible: {
                type: Boolean,
            },
            wordId: {
                type: Number
            },
            word: {
                type: String
            },
            field: {
                type: String
            },
            definitionApi: {
                type: String
            },
            exampleApi: {
                type: String
            },
            updateApi: {
                type: String
            },
            definition: {
                type: String
            },
            example: {
                type: String
            },
        },
        data () {
            return {
                form: {
                    type: '',
                    definition: '',
                    example: ''
                },
                define: '',
                loading: false,
                definitions: [],
                examples: [],
                message: ''
            }
        },
        async created() {
            if (this.isDefinition) {
                await this.fetchDefinitions()
                this.form.definition = this.definition
            }
            if (this.isExample) {
                await this.fetchExample()
                this.form.example = this.example
            }
        },
        computed: {
            isDefinition() {
                return this.field === DEFINITION
            },
            isExample() {
                return this.field === EXAMPLE
            }
        },
        methods: {
            fieldText(val) {
                if (val === DEFINITION) {
                    return 'Mô tả: '
                }
                if (val === EXAMPLE) {
                    return 'Ví dụ: '
                }
            },
            async fetchDefinitions() {
                this.loading = true
                await axios
                    .get(this.definitionApi + '?word=' + this.word)
                    .then((response) => {
                        this.definitions = response.data.data.definitions
                        if (this.definitions.length === 0) {
                            this.message = 'Chưa có định nghĩa sẵn có!'
                        }
                    })
                    .catch(() => {
                        apiError('Không thể lấy danh sách')
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            fetchExample() {
                this.loading = true
                axios
                    .get(this.exampleApi + '?word=' + this.word)
                    .then((response) => {
                        this.examples = response.data.data.examples
                        if (this.examples.length === 0) {
                            this.message = 'Chưa có ví dụ sẵn có.'
                        }
                    })
                    .catch(() => {
                        apiError('Không thể lấy ví dụ')
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            changeWord(type, definition) {
                this.form.type = type
                this.form.definition = definition
            },
            submitForm() {
                const data = {
                    id: this.wordId,
                    field: this.field
                }
                if (this.isDefinition) {
                    data.type = this.form.type
                    data.value = this.form.definition
                }
                if (this.isExample) {
                    data.value = this.form.example
                }

                axios
                    .post(this.updateApi, data)
                    .then(() => {
                        this.$emit('updateWord', data)
                    })
                    .catch(() => {
                        apiError('Không thể cập nhật')
                    })
                    .finally(() => {
                        this.cancelDialog()
                    })
            },
            cancelDialog() {
                this.$emit('cancelDialog')
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