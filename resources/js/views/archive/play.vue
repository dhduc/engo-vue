<template>
    <div id="quiz" class="play">
        <div>
            <el-row class="el-header">
                <el-form ref="form" :model="form" :inline="true">
                    <el-form-item label="">
                        <el-button :type="form.sound ? 'primary' : ''" icon="el-icon-set-up" title="Âm thanh" @click="form.sound = !form.sound">Âm thanh</el-button>
                    </el-form-item>
                    <el-form-item v-if="false" label="">
                        <el-button :type="form.auto ? 'primary' : ''" icon="el-icon-timer" title="Tự động" @click="form.auto = !form.auto">Tự động</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button :type="form.audioPlay ? 'primary' : ''" icon="el-icon-headset" title="Phát âm" @click="form.audioPlay = !form.audioPlay">
                            Phát âm
                        </el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button :disabled="disabledAnswerModal" type="success" icon="el-icon-trophy" title="Kết quả" @click="showAnswerModal()">Kết quả</el-button>
                    </el-form-item>
                </el-form>
            </el-row>
            <hr />
            <el-row>
                <el-col :span="24" class="box">
                        <el-main :loading="loading" v-if="!loading" class="text-center">
                            <el-progress :text-inside="false" :stroke-width="20" :percentage="percent | round"
                                         :format="formatPercent" color="#5cb87a" id="progress"
                            ></el-progress>
                            <br>
                            <h3>{{ questionTitle }}</h3>
                            <h2 class="title">
                                <el-button :disabled="question.sound === null" title="Phát âm" type="primary" circle @click="playSound(question.sound)"><i class="fas fa-volume-up"></i></el-button>
                                <span class="word">{{ question.en }}</span>
                                <el-popover
                                        v-if="question.definition"
                                        placement="bottom"
                                        title=""
                                        trigger="manual"
                                        v-model="visible"
                                        :content="question.definition">
                                    <el-button icon="el-icon-info" type="info" slot="reference" circle @click="visible = !visible"></el-button>
                                </el-popover>
                            </h2>
                            <el-row class="tag-group">
                                <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12" v-for="(item, index) in answers" :key="index" :class="'button-group button-group-' + form.level">
                                    <el-button :disabled="answered" class="button" :type="getAnswerType(item)" round @click="selectAnswer(item)">
                                        <el-tag size="mini" class="tag">{{ index + 1 }}</el-tag>
                                        {{ getAnswerLabel(item) }}
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-main>
                        <hr />
                        <el-footer>
                            <div class="left">
                                <el-button v-if="!answered" icon="el-icon-warning-outline" type="warning" class="" @click="nextQuestion">Bỏ qua</el-button>
                                <div v-else class="text-left">
                                    <strong>{{ question.en }}</strong>&nbsp;<em>{{ question.phonetic }}</em>
                                    <p>{{ question.definition }}</p>
                                    <p>{{ question.vi }}</p>
                                </div>
                            </div>

                            <el-button v-if="!answered" :disabled="!answered" icon="el-icon-circle-check" type="primary" class="right" @click="checkAnswer">
                                Kiểm tra
                            </el-button>
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
                <span><el-tag effect="dark"><i class="el-icon-right"></i></el-tag> Tiếp theo</span>
                <el-divider direction="vertical"></el-divider>
                <span><el-tag effect="dark">Alt</el-tag> Phát âm</span>

                <template v-if="!loading && question.definition">
                    <el-divider direction="vertical"></el-divider>
                    <span><el-tag effect="dark">Shift</el-tag> Gợi ý</span>
                </template>
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
    import {QUIZ_REPORT_TYPE, EASY, MEDIUM, HARD, ARROW_RIGHT_KEY_CODE} from '../constants/index'
    import ReportModal from '../components/ReportModal.vue'
    import AnswerModal from '../components/AnswerModal.vue'
    import ResultModal from '../components/ResultModal.vue'

    const DEFAULT_STATUS = 'primary'
    const SUCCESS_STATUS = 'success'
    const DANGER_STATUS = 'danger'
    const WARNING_STATUS = 'warning'
    const EXCEPTION_STATUS = 'exception'
    const ANSWER_KEYS = ['1', '2', '3', '4', '5', '6']
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
            }
        },
        data() {
            return {
                loading: false,
                reset: false,
                dialogTitle: 'Kết thúc',
                questionTitle: 'Lựa chọn câu trả lời đúng nhất',
                form: {
                    sound: false,
                    auto: false,
                    level: MEDIUM,
                    easy: EASY,
                    medium: MEDIUM,
                    hard: HARD,
                    listenType: false,
                    audioPlay: false
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
                visible: false,
                startTime: 0,
                totalTime: 0,
                disabledAnswerModal: false,
                isShowAnswerModal: false
            }
        },
        async created() {
            this.percent = this.remembersCount * 100 / this.wordsCount
            await this.fetchQuestions()
            this.startTime = new Date().getTime()
            this.successPlayer = document.getElementById('success-audio');
            this.failurePlayer = document.getElementById('failure-audio');
        },
        mounted: function () {
            this.$nextTick(function () {
                window.addEventListener('keyup', event => {
                    if (event.target.localName !== 'body') {
                        return false
                    }

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

                    if (ANSWER_KEYS.includes(event.key) && !this.answered) {
                        this.selectAnswer(this.answers[Number(event.key) - 1])
                    }
                })
            })
        },
        methods: {
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
                this.getAnswers(this.question.id)
                if (this.form.audioPlay) {
                    setTimeout(() => {
                        this.setAudio(this.question)
                    }, 500)
                }
            },
            getAnswers(wordId) {
                const URL = this.answersApi + '?wordId=' + wordId + '&level=' + this.form.level
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
            getAnswerLabel(item) {
                if (this.form.listenType) {
                    return item.en;
                }

                return item.vi;
            },
            changeType() {
                this.getQuestion()
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
            selectAnswer(item) {
                this.answer = item
                this.answerStatus = DEFAULT_STATUS
                this.checkAnswer()
            },
            getAnswerType(item) {
                if (!this.answer) {
                    return ''
                }
                return this.answer.id === item.id ? this.answerStatus : ''
            },
            checkAnswer() {
                this.visible = false
                if (!this.answer || this.answered) {
                    return false
                }
                if (this.answer.id === this.question.id) {
                    this.answerStatus = SUCCESS_STATUS
                    this.form.sound && this.successPlayer.play()

                    if (this.percent < 100) {
                        this.percent += parseInt(this.getPercent())
                        this.correct++
                    }

//                    if (this.correct === (this.wordsCount - this.remembersCount)) {
//                        this.percent = 100
//                    }
                } else {
                    this.answerStatus = DANGER_STATUS
                    this.form.sound && this.failurePlayer.play()
                }
                this.postAnswer(this.question, this.answer)

                this.answered = true
                if (this.form.auto) {
                    this.loading = true
                    this.nextQuestion()
                }
            },
            postAnswer(question, answer) {
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
                        word: question.en,
                        answer: answer.en,
                        time: this.totalTime
                    })
                    .then(() => {
                        this.disabledAnswerModal = false
                    })
                    .catch(() => {
                        apiError('Không thể cập nhật câu trả lời')
                    })
            },
            changeLevel() {
                this.getQuestion()
            },
            nextQuestion() {
                if (this.currentQuestion < this.questions.length - 1) {
                    this.currentQuestion++
                    this.getQuestion()
                } else {
                    this.completed = true
                }
                this.loading = false
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
