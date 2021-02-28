<template>
    <div class="main-content">
        <nav v-if="started" class="navbar navbar-expand-md navbar navbar-auth navbar-dark bg-primary" id="navbar-main">
            <div class="container-fluid content">
                <!-- Brand -->
                <a tabindex="-1" class="h2 mb-0 text-uppercase d-lg-inline-block text-white brand" href="javascript: void(0)">
                    <span class="h2 text-white">{{ topic.name }}</span>
                </a>
                <button tabindex="-1" @click="goBack" class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-collapse-main" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <i class="fas fa-times"></i>
                </button>
                <div class="collapse navbar-collapse" id="navbar-collapse-main">
                    <!-- Collapse header -->
                    <div class="navbar-collapse-header d-md-none">
                        <div class="row">
                            <div class="col-6 collapse-brand">
                                <a href="javascript: void(0)">
                                    <img src="/img/brand/logo-white.png" alt="Engo Pro" />
                                </a>
                            </div>
                            <div class="col-6 collapse-close">
                                <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbar-collapse-main" aria-controls="sidenav-main" aria-expanded="false" aria-label="Toggle sidenav">
                                    <span></span>
                                    <span></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div v-if="!started" class="container-fluid welcome">
            <div class="row">
                <div class="col-12 order-1">
                    <div class="row justify-content-center align-items-center">
                        <div class="col-lg-7 text-center pt-lg">
                            <p><img src="/img/brand/logo-blue.png" class="img-fluid" style="width: 200px;"></p>
                            <h1 class="h1">{{ topic.name }}</h1>
                            <p class="lead text-primary">{{ topic.words_count + ' Từ vựng' }}</p>
                            <div class="btn-wrapper">
                                <button type="" class="btn mb-3 mb-sm-0 btn-round btn-icon btn-primary w-80 max-w" @click="getStarted()">
                                    <i class="fas fa-paper-plane"></i> Bắt đầu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="started" class="progress">
            <div class="progress-bar bg-primary"
                 role="progressbar"
                 aria-valuemin="0"
                 aria-valuemax="100"
                 :aria-valuenow="percent | round"
                 :style="formatPercent()"
            >
            </div>
        </div>

        <div v-if="started" :loading="loading">
            <div v-if="step === steps.review" class="row flip mb-7 mt-2">
                <vue-flip :bindWithMe="flipped" width="100%" height="200px">
                    <div slot="front">
                        <div class="card box-card text-center">
                            <div class="card-header">
                                <span :class="'icon icon-shape rounded-circle ' + (audioLoading ? '' : 'text-white bg-gradient-primary')" :disabled="question.sound === null" title="Phát âm" @click="playSound(question.sound)">
                                    <i class="fas fa-volume-up"></i>
                                </span>
                                <span class="icon icon-shape bg-gradient-primary rounded-circle text-white" title="Xoay" @click="flipCard()">
                                    <i class="fas fa-redo"></i>
                                </span>
                            </div>
                            <div class="card-body" @click="flipCard()">
                                <div class="text-center">
                                    <h1 class="h1">{{ question.en }}</h1>
                                    <em>{{ question.phonetic }}</em>
                                    <p><em>{{ question.type }}</em> {{ question.definition }}</p>
                                    <p>{{ question.example }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div slot="back">
                        <div class="card box-card text-center">
                            <div class="card-header">
                                <span class="icon icon-shape bg-gradient-primary rounded-circle text-white" :disabled="question.sound === null" title="Phát âm" @click="playSound(question.sound)">
                                    <i class="fas fa-volume-up"></i>
                                </span>
                                <span class="icon icon-shape bg-gradient-primary rounded-circle text-white" title="Xoay" @click="flipCard()">
                                    <i class="fas fa-redo"></i>
                                </span>
                            </div>
                            <div class="card-body" @click="flipCard()">
                                <div class="text-center">
                                    <h1 class="h1">{{ question.vi }}</h1>
                                    <p>{{ question.example }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </vue-flip>
            </div>

            <div v-if="step === steps.listen" class="row listen">
                <div class="card text-center">
                    <div class="card-header">
                        <span class="icon icon-shape bg-gradient-primary rounded-circle text-white" :disabled="question.sound === null" title="Phát âm" @click="playSound(question.sound)">
                            <i class="fas fa-volume-up"></i>
                        </span>
                    </div>
                    <div class="card-body">
                        <div v-if="answered">
                            <h1><span class="word">{{ question.en }}</span></h1>
                            <em>{{ question.phonetic }}</em>
                        </div>
                        <div class="">
                            <h2 v-if="!answered" class="h2 box-center">Nhập từ nghe được</h2>
                            <input tabindex="0" :class="'form-control max-w listen-input' + ' text-' + answerStatus" ref="input" v-model="answer" :disabled="answered" :autofocus="true" @keyup.enter="checkListenAnswer" />
                        </div>
                        <div class="row">
                            <h2 v-if="examples.length" class="h2 box-center">
                                <span>{{ examples[0].trim() }}</span>
                                <span :class="'text-' + answerStatus">{{ answer | space }}</span>
                                <span v-if="examples.length > 1">{{ examples[1].trim() }}</span>
                            </h2>
                            <h2 v-else class="h2 box-center"><span :class="'text-' + answerStatus">{{ answer | space }}</span></h2>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="step === steps.play" class="row play">
                <div class="card text-center">
                    <div class="card-header">
                        <span class="icon icon-shape bg-gradient-primary rounded-circle text-white" :disabled="question.sound === null" title="Phát âm" @click="playSound(question.sound)">
                            <i class="fas fa-volume-up"></i>
                        </span>
                        <span class="word h2 ml-2">{{ question.en }}</span>
                        <em>{{ question.phonetic }}</em>
                    </div>
                    <div class="card-body">
                        <div v-for="(item, index) in answers" :key="index" class="w-100">
                            <button :class="'btn btn-answer btn-round w-100 max-w btn-' + getAnswerType(item)" :disabled="answered" @click="selectAnswer(item)">
                                <span class="badge badge-pill badge-default d-only mr-2">{{ index + 1 }}</span>
                                {{ getAnswerLabel(item) }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row footer mb-3 d-only">
                <div class="card text-center w-100">
                    <div class="card-body">
                        <div class="text-center">
                            <span class="mr-3"><span class="badge badge-pill badge-default">Alt</span>: Phát âm</span>
                            <span v-if="step === steps.review" class="mr-3"><span class="badge badge-pill badge-default mr-2">Space</span>: Xoay thẻ</span>
                            <span v-if="step === steps.listen && !answered" class="mr-3"><span class="badge badge-pill badge-default mr-2">Enter</span>: Trả lời</span>
                            <span v-if="answered" class="mr-3"><span class="badge badge-pill badge-default mr-2">Enter</span>: Tiếp tục</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row footer">
                <div class="card text-center w-100">
                    <div class="card-body">
                        <div class="text-center">
                            <button v-if="!answered" class="btn btn-primary btn-round w-80 max-w" :disabled="!answer" @click="checkListenAnswer">
                                <i class="fas fa-check"></i> Kiểm tra
                            </button>
                            <div v-else class="">
                                <button v-if="!completed" class="btn btn-info btn-round w-80 max-w" @click="nextQuestion">
                                    <i class="fas fa-caret-right"></i> Tiếp tục
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="audio">
                <audio v-show="false" controls>
                    <source :src="question.sound" type="audio/mpeg">
                </audio>
            </div>

            <div v-if="completed" class="modal fade show" id="modal-result" tabindex="-1" role="dialog" aria-labelledby="modal-result" aria-hidden="true" style="display: block; padding-right: 0px;">
                <div class="modal-dialog modal modal-dialog-centered modal-" role="document">
                    <div class="modal-content bg-gradient">
                        <div class="modal-body">
                            <div class="py-3 text-center">
                                <i class="trophy fas fa-4x fa-trophy"></i>
                                <h4 class="heading mt-4">Kết Quả!</h4>
                                <div>
                                    <i class="text-primary fas fa-volume-up"></i>&nbsp;
                                    <span class="text-success"><i class="fas fa-check"></i> {{ listenCorrect }} đúng</span>
                                    <span class="divider mr-2"></span>
                                    <span class="text-danger"><i class="fas fa-times"></i> {{ listenIncorrect }} sai</span>
                                </div>
                                <div>
                                    <i class="text-primary fas fa-play-circle"></i>&nbsp;
                                    <span class="text-success"><i class="fas fa-check"></i> {{ playCorrect }} đúng</span>
                                    <span class="divider mr-2"></span>
                                    <span class="text-danger"><i class="fas fa-times"></i> {{ playIncorrect }} sai</span>
                                </div>
                                <div class="star mt-3">
                                    <i :class="'fas fa-2x fa-star ' + getStarColor(20)"></i>
                                    <i :class="'fas fa-2x fa-star ' + getStarColor(40)"></i>
                                    <i :class="'fas fa-2x fa-star ' + getStarColor(60)"></i>
                                    <i :class="'fas fa-2x fa-star ' + getStarColor(80)"></i>
                                    <i :class="'fas fa-2x fa-star ' + getStarColor(100)"></i>
                                </div>
                                <br>
                                <button type="button" class="btn btn-primary btn-round" @click="goBack">Ok, Got it</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-backdrop fade show"></div>
            </div>

        </div>

        <div class="sound">
            <audio v-show="false" id="success-audio" controls>
                <source :src="successAudio" type="audio/mpeg">
            </audio>
            <audio v-show="false" id="failure-audio" controls>
                <source :src="failureAudio" type="audio/mpeg">
            </audio>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    import VueFlip from 'vue-flip'
    import {QUIZ_REPORT_TYPE, EASY, MEDIUM, HARD} from '../constants/index'

    const DEFAULT_STATUS = 'primary'
    const SUCCESS_STATUS = 'success'
    const DANGER_STATUS = 'danger'
    const WARNING_STATUS = 'warning'
    const EXCEPTION_STATUS = 'exception'
    const ANSWER_KEYS = ['1', '2', '3', '4', '5', '6']
    const ENTER_KEY_CODE = 13
    const ALT_KEY_CODE = 18
    const SPACE_KEY_CODE = 32

    const apiError = (msg) => {
        alert(msg)
    }

    export default {
        props: {
            topicId: {
                type: Number
            },
            wordsCount: {
                type: Number
            },
            topicData: {
                type: String
            },
            wordsApi: {
                type: String
            },
            answersApi: {
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
            }
        },
        components: {
            'vue-flip': VueFlip
        },
        filters: {
            round(val) {
                return val ? parseInt(val) : 0;
            },
            space(val) {
                return val && val.length ? val : '...';
            },
        },
        computed: {
            isSafari() {
                return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            }
        },
        data() {
            return {
                started: false,
                topic: {},
                step: 0,
                loading: false,
                reset: false,
                dialogTitle: 'Kết thúc',
                questionTitle: 'Lựa chọn câu trả lời đúng nhất',
                form: {
                    sound: true,
                    auto: false,
                    level: MEDIUM,
                    easy: EASY,
                    medium: MEDIUM,
                    hard: HARD,
                    listenType: false,
                    audioPlay: false
                },
                steps: {
                    review: 1,
                    listen: 2,
                    play: 3
                },
                flipped: false,
                percent: 0,
                total: 0,
                listenCorrect: 0,
                listenIncorrect: 0,
                playCorrect: 0,
                playIncorrect: 0,
                answered: false,
                currentQuestion: 0,
                question: null,
                examples: [],
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
                isShowAnswerModal: false,
                ratePercent: 0,
                audioLoading: true
            }
        },
        async created() {
            await this.fetchQuestions()
            this.startTime = new Date().getTime()
            this.topic = JSON.parse(this.topicData)
        },
        mounted: function () {
            this.$nextTick(() => {
                this.successPlayer = document.getElementById('success-audio');
                this.failurePlayer = document.getElementById('failure-audio');

                window.addEventListener('keyup', event => {
                    switch(event.keyCode) {
                        case ALT_KEY_CODE:
                            this.playSound(this.question.sound)
                            break;
                        case SPACE_KEY_CODE:
                            this.step === this.steps.review && this.flipCard()
                            break;
                    }

                    if (event.target.localName !== 'input' && event.keyCode === ENTER_KEY_CODE && this.answered) {
                        this.nextQuestion()
                    }

                    if (this.step === this.steps.play && ANSWER_KEYS.includes(event.key) && !this.answered) {
                        this.selectAnswer(this.answers[Number(event.key) - 1])
                    }
                })
            })
        },
        watch: {
            step: function (val) {
                if (val === this.steps.review) this.answered = true
            },
            completed: function (val) {
                if (val) this.percent = 100
            }
        },
        methods: {
            getStarted() {
                this.started = true
                this.step = this.steps.review
                this.getQuestion()
            },
            goBack() {
                this.started = false
                this.step = 0
                this.answered = false
                this.answer = ''
                this.answerStatus = DEFAULT_STATUS
                this.currentQuestion = 0
                this.completed = false
                this.percent = 0
                this.listenCorrect = 0
                this.listenIncorrect = 0
                this.playCorrect = 0
                this.playIncorrect = 0
            },
            goRefresh() {
                this.currentQuestion = 0
                this.completed = false
                this.percent = 0
                this.correct = 0
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

                if (this.question.example) {
                    this.examples = this.question.example.toLocaleLowerCase().split(this.question.en.toLocaleLowerCase())
                } else {
                    this.getExample(this.question)
                }

                this.focusInput()
                setTimeout(() => {
                    this.setAudio(this.question)
                }, 500)
            },
            flipCard() {
                this.flipped = !this.flipped
            },
            focusInput() {
                if (this.step === this.steps.listen) {
                    setTimeout(() => {
                        this.$refs.input.focus();
                    }, 500)
                }
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
                    .catch(() => {
                    })
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
                    this.audioLoading = true
                    this.fetchAudio(URL)
                        .then((response) => {
                            this.audioLoading = false
                            let blob = new Blob([response.value], {type: 'audio/mp3'});
                            let url = window.URL.createObjectURL(blob);
                            question.sound = url;
                            window.audio = new Audio();
                            window.audio.src = url;
                            window.audio.play();
                        });
                }
            },
            playSound(url) {
                window.audio = new Audio();
                window.audio.src = url;
                const promise = window.audio.play();
                if (promise !== undefined) {
                    promise.catch(error => {
                        console.log('[Info] Auto-play was prevented', error);
                        // Show a UI element to let the user manually start playback
                    }).then(() => {
                        // Auto-play started
                    });
                }
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
            formatPercent() {
                return `width: ${this.percent}%`
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
                this.checkQuizAnswer()
            },
            getAnswerType(item) {
                if (!this.answer) {
                    return 'outline-primary'
                }
                return this.answer.id === item.id ? this.answerStatus : item.id === this.question.id ? 'success' : 'outline-primary'
            },
            checkListenAnswer() {
                this.visible = false
                if (!this.answer || this.answered) {
                    return false
                }

                const answerStr = this.answer.toLocaleLowerCase()
                const wordStr = this.question.en.toLocaleLowerCase()
                if (answerStr === wordStr) {
                    this.answerStatus = SUCCESS_STATUS
                    this.form.sound && this.playSound(this.successAudio)
                    this.listenCorrect++
                } else {
                    this.answerStatus = DANGER_STATUS
                    this.form.sound && this.playSound(this.failureAudio)
                    this.listenIncorrect++
                }

                
                this.postAnswer()
            },
            checkQuizAnswer() {
                this.visible = false
                if (!this.answer || this.answered) {
                    return false
                }

                if (this.answer.id === this.question.id) {
                    this.answerStatus = SUCCESS_STATUS
                    this.form.sound && this.playSound(this.successAudio)
                    this.playCorrect++
                } else {
                    this.answerStatus = DANGER_STATUS
                    this.form.sound && this.playSound(this.failureAudio)
                    this.playIncorrect++
                }

                
                this.postAnswer()
            },
            postAnswer() {
                this.answered = true
                this.total++
                const now = new Date().getTime()
                const time = now - this.startTime
                this.startTime = now
                this.totalTime += time

                if (this.total === (this.wordsCount * 2)) {
                    this.percent = 100
                    this.completed = true
                    this.setRatePercent()
                }

                if (this.form.auto) {
                    this.loading = true
                    this.nextQuestion()
                }
            },
            changeLevel() {
                this.getQuestion()
            },
            nextQuestion() {
                if (this.step === this.steps.play) {
                    this.loading = false
                    this.step = this.steps.review
                    this.answered = true

                    if (this.percent < 100) {
                        this.percent += parseInt(this.getPercent())
                    }
                    if (this.currentQuestion < this.questions.length - 1) {
                        this.currentQuestion++
                        this.getQuestion()
                    } else {
                        this.percent = 100
                        this.completed = true
                        this.setRatePercent()
                    }
                } else {
                    this.answered = false
                    this.step++
                    this.answer = ''
                    this.answerStatus = DEFAULT_STATUS
                    this.playSound(this.question.sound)
                }
                this.focusInput()
            },
            setRatePercent() {
                this.ratePercent = (this.listenCorrect + this.playCorrect) * 100 / (this.wordsCount * 2)
            },
            getStarColor(min) {
                return this.ratePercent >= min ? 'active' : ''
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
