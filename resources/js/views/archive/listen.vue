<template>
    <div id="quiz">
        <div>
            <el-row class="el-header">
                <el-form ref="form" :model="form" :inline="true">
                    <el-form-item label="">
                        <el-button :type="form.sound ? 'primary' : ''" icon="el-icon-set-up" title="Âm thanh" @click="form.sound = !form.sound">Âm thanh</el-button>
                    </el-form-item>
                    <el-form-item v-if="false" label="">
                        <el-button :type="form.auto ? 'primary' : ''" icon="el-icon-timer" title="Tự động" @click="form.auto = !form.auto">Tự động</el-button>
                    </el-form-item>
                    <el-form-item label="">
                        <el-button :type="form.audioPlay ? 'primary' : ''" icon="el-icon-headset" title="Phát âm" @click="form.audioPlay = !form.audioPlay">
                            Phát âm
                        </el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button :disabled="disabledAnswerModal" type="success" icon="el-icon-trophy" title="Kết quả" @click="showAnswerModal()">Kết quả</el-button>
                    </el-form-item>
                </el-form>
            </el-row>
            <hr>
            <el-row>
                <el-col :span="24" class="box">
                        <el-main :loading="loading" v-if="!loading" class="text-left">
                            <h3>{{ questionTitle }}</h3>
                            <br>
                            <el-row :gutter="20">
                                <el-col :xs="8" :sm="6" :md="4" :lg="2" :xl="2">
                                    <el-button :disabled="question.sound === null" title="Phát âm" type="primary" circle @click="playSound(question.sound)"><i class="fas fa-volume-up"></i></el-button>
                                    <el-popover
                                        v-if="question.phonetic"
                                        placement="bottom"
                                        title=""
                                        trigger="manual"
                                        v-model="visible"
                                        :content="question.phonetic">
                                        <el-button icon="el-icon-info" type="info" slot="reference" circle @click="visible = !visible"></el-button>
                                    </el-popover>
                                </el-col>
                                <el-col :xs="16" :sm="14" :md="12" :lg="10" :xl="10">
                                    <el-input ref="input" v-model="answer" :disabled="answered" :autofocus="true" @keyup.enter.native="checkAnswer" style="font-size: 25px"></el-input>
                                </el-col>
                            </el-row>
                            <br>
                            <el-row>
                                <h2 v-if="examples.length">
                                    <span>{{ examples[0].trim() }}</span>
                                    <span :class="'text-' + answerStatus">{{ answer | space }}</span>
                                    <span v-if="examples.length > 1">{{ examples[1].trim() }}</span>
                                </h2>
                                <h2 v-else><span :class="'text-' + answerStatus">{{ answer | space }}</span></h2>
                            </el-row>
                        </el-main>
                        <hr>
                        <el-footer>
                            <div class="left">
                                <el-button v-if="!answered" icon="el-icon-warning-outline" type="warning" class="" @click="nextQuestion">Bỏ qua</el-button>
                                <div v-else class="text-left" style="font-size: 20px">
                                    <strong class="text-success">{{ question.en }}</strong>&nbsp;<em>{{ question.phonetic }}</em>
                                    <p>{{ question.definition }}</p>
                                </div>
                            </div>

                            <el-button v-if="!answered" icon="el-icon-circle-check" type="primary" class="right" @click="checkAnswer">Kiểm tra</el-button>
                            <div v-else class="right">
                                <!--<el-button icon="el-icon-s-flag" type="warning" @click="showReportWord">Báo cáo</el-button>-->
                                <el-button v-if="!completed" icon="el-icon-circle-check" type="success" @click="nextQuestion">Tiếp theo</el-button>
                                <el-button v-else icon="el-icon-refresh" type="primary" @click="goRefresh">Bắt đầu lại</el-button>
                            </div>
                        </el-footer>
                    <div class="sound">
                        <audio v-show="false" id="success-audio">
                            <source :src="successAudio" type="audio/mpeg">
                        </audio>
                        <audio v-show="false" id="failure-audio">
                            <source :src="failureAudio" type="audio/mpeg">
                        </audio>
                    </div>
                </el-col>
            </el-row>
            <hr />
            <el-row class="row-footer">
                <p class="text-primary">
                    <span><el-tag effect="dark"><i class="el-icon-right"></i></el-tag> Tiếp theo</span>
                    <el-divider direction="vertical"></el-divider>
                    <span><el-tag effect="dark">Alt</el-tag> Phát âm</span>
                    <el-divider direction="vertical"></el-divider>
                    <span><el-tag effect="dark">Enter</el-tag> Trả lời</span>

                    <template v-if="!loading && question.phonetic">
                        <el-divider direction="vertical"></el-divider>
                        <span><el-tag effect="dark">Shift</el-tag> Gợi ý</span>
                    </template>
                </p>
            </el-row>
            <result-modal
                v-if="completed"
                :visible="completed"
                :correct="correct"
                :percent="percent | round"
                @goRefresh="goRefresh"
                @closeResultModal="closeResultModal"
            />
            <answer-modal
                v-if="isShowAnswerModal"
                :visible="isShowAnswerModal"
                :results-api="resultsApi"
                :words-count="wordsCount"
                @closeAnswerModal="closeAnswerModal"
            />
            <report-modal
                    v-if="isShowReport"
                    :is-show-report="isShowReport"
                    :topic-id="topicId"
                    :word-id="wordId"
                    :word-name="question.en"
                    :report-type="reportType"
                    :report-subjects="reportSubjects"
                    :report-api="reportApi"
                    @cancelReportWord="cancelReportWord"
            />
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    import {apiError} from '../functions/index'
    import {QUIZ_REPORT_TYPE, ARROW_RIGHT_KEY_CODE} from '../constants/index'
    import ReportModal from '../components/ReportModal.vue'
    import AnswerModal from '../components/AnswerModal.vue'
    import ResultModal from '../components/ResultModal.vue'

    const DEFAULT_STATUS = 'primary'
    const SUCCESS_STATUS = 'success'
    const DANGER_STATUS = 'danger'
    const WARNING_STATUS = 'warning'
    const EXCEPTION_STATUS = 'exception'
    const ALT_KEY_CODE = 18
    const SHIFT_KEY_CODE = 16

    export default {
        props: {
            topicId: {
                type: Number
            },
            wordsApi: {
                type: String
            },
            answersApi: {
                type: String
            },
            answerApi: {
                type: String
            },
            resultsApi: {
                type: String
            },
            remembersCount: {
                type: Number
            },
            wordsCount: {
                type: Number
            },
            reportSubjects: {
                type: String
            },
            reportApi: {
                type: String
            },
            successAudio: {
                type: String
            },
            failureAudio: {
                type: String
            },
            speechApi: {
                type: String
            },
            exampleApi: {
                type: String
            },
            playType: {
                type: Number
            }
        },
        components: {
            'report-modal': ReportModal,
            'result-modal': ResultModal,
            'answer-modal': AnswerModal
        },
        filters: {
            round(val) {
                return parseInt(val);
            },
            space(val) {
                return val && val.length ? val : '...';
            },
        },
        data() {
            return {
                loading: false,
                reset: false,
                dialogTitle: 'Hoàn thành',
                questionTitle: 'Nhập từ nghe được vào ô trống',
                form: {
                    sound: false,
                    auto: false,
                    audioPlay: true
                },
                percent: 0,
                correct: 0,
                answered: false,
                currentQuestion: 0,
                question: null,
                answer: '',
                answers: [],
                answerStatus: DEFAULT_STATUS,
                completed: false,
                showCompleted: false,
                questions: [],
                wordId: null,
                reportType: QUIZ_REPORT_TYPE,
                isShowReport: false,
                successPlayer: null,
                failurePlayer: null,
                examples: [],
                visible: false,
                startTime: 0,
                totalTime: 0,
                disabledAnswerModal: false,
                isShowAnswerModal: false
            }
        },
        async created() {
            await this.fetchQuestions()
            this.startTime = new Date().getTime()
            this.successPlayer = document.getElementById('success-audio');
            this.failurePlayer = document.getElementById('failure-audio');
        },
        mounted: function () {
            this.$nextTick(function () {
                window.addEventListener('keyup', (event) => {
                    switch(event.keyCode) {
                        case ARROW_RIGHT_KEY_CODE:
                            this.nextQuestion()
                            break
                        case ALT_KEY_CODE:
                            this.playSound(this.question.sound)
                            break
                        case SHIFT_KEY_CODE:
                            this.visible = !this.visible
                            break
                    }
                })
                setTimeout(() => {
                    this.focusInput()
                }, 500)
            })
        },
        methods: {
            focusInput() {
                this.$refs.input.$el.children[0].focus();
            },
            goRefresh() {
                this.currentQuestion = 0
                this.completed = false
                this.fetchQuestions()
                this.getQuestion()
            },
            showAnswerModal() {
                this.isShowAnswerModal = true
            },
            closeAnswerModal() {
                this.isShowAnswerModal = false
            },
            async fetchQuestions() {
                this.loading = true
                axios
                    .get(this.wordsApi)
                    .then(response => {
                        this.questions = response.data.data.words
                        this.loading = false
                        if (this.questions.length === 0) {
                            this.reset = true
                        } else {
                            this.getQuestion()
                        }
                    })
                    .catch(() => {
                        apiError('Không thể lấy câu hỏi')
                    });
            },
            getQuestion() {
                this.visible = false
                this.question = this.questions[this.currentQuestion]
                this.wordId = this.question.id
                this.answered = false
                this.answer = null
                this.answerStatus = DEFAULT_STATUS
                setTimeout(() => {
                    this.setAudio(this.question)
                }, 500)

                if (this.question.example) {
                    this.examples = this.question.example.toLocaleLowerCase().split(this.question.en.toLocaleLowerCase())
                } else {
                    this.getExample(this.question)
                }

                setTimeout(() => {
                    this.focusInput()
                }, 500)
            },
            getExample(question) {
                axios
                    .get(this.exampleApi, {
                        word: question.en
                    })
                    .then((response) => {
                        this.question.example = response.data.data.examples.length ? response.data.data.examples[0] : ''
                        this.examples = this.question.example && this.question.example.toLocaleLowerCase().split(this.question.en.toLocaleLowerCase())
                    })
                    .catch((error) => {
                        console.error('example', error);
                    })
            },
            getAnswers(wordId) {
                const URL = this.answersApi + '?wordId=' + wordId
                axios
                    .get(URL)
                    .then(response => {
                        this.answers = response.data.data.answers.sort(() => Math.random() - 0.5)
                    })
                    .catch(() => {
                        apiError('Không thể lấy câu trả lời')
                    });
            },
            fetchAudio(URL) {
                return fetch(URL)
                    .then((res) => {
                        let reader = res.body.getReader();
                        return reader
                            .read()
                            .then((result) => {
                                return result;
                            });
                    });
            },
            setAudio(question) {
                const URL = this.speechApi + '?word=' + question.en
                if (question.sound === null || question.sound === undefined) {
                    this.fetchAudio(URL)
                    .then((response) => {
                        let blob = new Blob([response.value], {type: 'audio/mp3'});
                        let url = window.URL.createObjectURL(blob);
                        question.sound = url;
                        if (this.form.audioPlay) {
                            window.audio = new Audio();
                            window.audio.src = url;
                            window.audio.play();
                        }
                    });
                }
            },
            playSound(url) {
                window.audio = new Audio();
                window.audio.src = url;
                window.audio.play();
            },
            formatPercent(percent) {
                return percent === 100 ? '' : percent === 0 ? '' : `${percent}%`
            },
            formatComplete(percent) {
                return percent === 100 ? 'Done' : percent === 0 ? 'Fail' : `${Math.ceil(percent)}%`
            },
            statusComplete() {
                return this.percent === 100 ? SUCCESS_STATUS : this.percent === 0 ? EXCEPTION_STATUS : WARNING_STATUS
            },
            getPercent() {
                return 100 / this.wordsCount
            },
            checkAnswer() {
                if (!this.answer) {
                    return false
                }

                this.visible = false
                const answerStr = this.answer.toLocaleLowerCase()
                const wordStr = this.question.en.toLocaleLowerCase()
                if (answerStr === wordStr) {
                    this.answerStatus = SUCCESS_STATUS
                    this.form.sound && this.successPlayer.play()

                    if (this.percent < 100) {
                        this.percent += parseInt(this.getPercent())
                        this.correct++
                    }

                    if (this.correct === (this.wordsCount - this.remembersCount)) {
                        this.percent = 100
                    }
                } else {
                    this.answerStatus = DANGER_STATUS
                    this.form.sound && this.failurePlayer.play()
                }

                this.answered = true
                this.postAnswer(wordStr, answerStr)
                if (this.form.auto) {
                    this.nextQuestion()
                }
            },
            postAnswer(word, answer) {
                const now = new Date().getTime()
                const time = now - this.startTime
                this.startTime = now
                this.totalTime += time

                this.disabledAnswerModal = true
                return axios
                    .post(this.answerApi, {
                        topicId: this.topicId,
                        wordId: this.wordId,
                        type: this.playType,
                        word: word,
                        answer: answer,
                        time: this.totalTime
                    })
                    .then(() => {
                        this.disabledAnswerModal = false
                    })
                    .catch(() => {
                        apiError('Không thể cập nhật câu trả lời')
                    })
            },
            nextQuestion() {
                if (this.currentQuestion < this.questions.length - 1) {
                    this.currentQuestion++
                    this.examples = []
                    this.getQuestion()
                } else {
                    this.completed = true
                }
            },
            closeResultModal() {
                this.completed = false
            },
            showReportWord() {
                this.isShowReport = true
            },
            cancelReportWord() {
                this.isShowReport = false
            },
        }
    }
</script>
