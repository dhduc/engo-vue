<template>
    <el-dialog
            :visible="isShowReport"
            :close-on-click-modal="false"
            title="Báo cáo từ vựng"
            class="eg-dialog"
            append-to-body
            @close="$emit('cancelReportWord')"
    >
        <div>
            <p>Từ vựng sẽ bị báo cáo: <span class="text-danger">{{ wordName }}</span></p>
            <p>Chọn nội dung mà bạn muốn báo cáo lỗi sai:</p>
            <el-form ref="reportForm">
                <el-form-item prop="subjects">
                    <el-checkbox-group v-model="subjects">
                        <div v-for="(subject, id) in originSubjects" :key="id">
                            <el-checkbox name="subject" :label="id">{{ subject }}</el-checkbox>
                        </div>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="$emit('cancelReportWord')">Hủy</el-button>
            <el-button :disabled="isDisabledReport" type="primary" @click="reportWord()">Báo cáo</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import axios from 'axios'
    import {apiSuccess, apiError} from '../functions/index'

    export default {
        name: 'ReportModal',

        props: {
            wordName: {
                type: String
            },
            isShowReport: {
                type: Boolean
            },
            topicId: {
                type: Number
            },
            wordId: {
                type: Number
            },
            reportType: {
                type: Number
            },
            reportSubjects: {
                type: String
            },
            reportApi: {
                type: String
            }
        },
        data() {
            return {
                subjects: [],
                originSubjects: [],
                isDisabledReport: true,
                rules: {
                    subjects: [
                        {required: true, message: 'Vui lòng chọn một chủ đề báo cáo!', trigger: 'change'}
                    ]
                }
            }
        },
        created() {
            this.originSubjects = JSON.parse(this.reportSubjects);
        },
        watch: {
            subjects: function (val) {
                this.isDisabledReport = !val.length
            }
        },
        methods: {
            reportWord() {
                this.isDisabledReport = true
                axios
                    .post(this.reportApi, {
                        topicId: this.topicId,
                        wordId: this.wordId,
                        type: this.reportType,
                        subjects: this.subjects.map((elm) => parseInt(elm)),
                    })
                    .then(() => {
                        apiSuccess('Báo cáo thành công');
                        this.$emit('cancelReportWord')
                    })
                    .catch(() => {
                        apiError('Không thể báo cáo')
                    })
                    .finally(() => {
                        this.isDisabledReport = false
                    })
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
