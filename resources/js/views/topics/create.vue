<template>
    <div id="create">
        <el-form v-if="optionTopics.length" ref="form" :model="form" :rules="rules" class="create" v-loading="loading" label-width="120px" label-position="top">
            <el-form-item label="Chủ đề" prop="topic">
                <el-select id="v-step-1" v-model="form.topic" :loading="topicLoading" placeholder="Lựa chọn chủ đề" @change="changeTopic">
                    <el-option
                        v-for="item in optionTopics"
                        :key="item.id"
                        :label="getTopicLabel(item)"
                        :value="item.id"
                    />
                    <template slot="empty">
                        <p class="el-select-dropdown__empty">
                            Danh sách trống
                        </p>
                    </template>
                </el-select>
            </el-form-item>
            <div v-if="isShowForm">
                <el-form-item v-if="showContent" class="normal" :label="getContentLabel()" prop="content">
                    <el-input id="v-step-3" type="textarea" v-model="form.content" :rows="20"></el-input>
                </el-form-item>

                <el-form-item v-if="showContent">
                    <button id="v-step-4" class="btn btn-primary" type="button" icon="el-icon-s-promotion" @click="submitForm('form')">Lựa chọn</button>
                    <button class="btn btn-secondary" type="button" icon="el-icon-delete" @click="resetForm('form')">Đặt lại</button>
                </el-form-item>
            </div>
            <div v-else>
                <p class="primary success"><span class="tag-group__title">Tổng số: {{ words.length }}</span></p>
                <el-form-item>
                    <el-checkbox :loading="allLoading" v-model="allChecked" @change="changeAll">Chọn tất cả</el-checkbox>
                </el-form-item>
                <el-form-item class="tag-group">
                    <el-button
                        v-for="(word, index) in words"
                        :key="index"
                        :icon="getWordIcon(word.check)"
                        :type="getWordType(word.check)"
                        @click="handleCheck(word)"
                    >
                        {{ word.en }}
                    </el-button>
                </el-form-item>
                <p class="text-primary success"><span class="tag-group__title">Đã chọn: {{ selectionWords.length }}</span></p>
                <el-form-item v-if="words">
                    <button class="btn btn-primary" type="button" icon="el-icon-s-promotion" :disabled="!selectionWords.length" @click="showPostData">Thực hiện</button>
                    <button class="btn btn-secondary" type="button" icon="el-icon-delete" @click="onCancel">Hủy</button>
                </el-form-item>
            </div>
        </el-form>
        <div v-else>
            <p class="mt-0 mb-5">Bạn chưa có topic nào!</p>
            <button class="btn btn-primary button-new-tag" type="button" icon="el-icon-edit" data-toggle="modal" data-target="#userTopic-0">Chủ đề mới</button>
        </div>
        <hr>
        <p class="text-info"><i class="el-icon-warning"></i> <span>Giới hạn là {{ WORD_LIMIT }} từ vựng!</span></p>
        <p class="text-info"><i class="el-icon-warning"></i> <span>Những từ ít hơn {{ MIN_WORD_LENGTH }} ký tự sẽ được bỏ qua!</span></p>
        <p class="text-info"><i class="el-icon-warning"></i> <span>Những từ đã có trong topic sẽ được bỏ qua!</span></p>

        <post-modal
          v-if="isShowPostData"
          :is-show-post-data="isShowPostData"
          :saveApi="saveApi"
          :topicId="form.topic"
          :topicURL="form.url"
          :words="words"
          :sentences="sentences"
          :save-result="saveResult"
          @closePostData="closePostData"
        />

        <v-tour v-if="startTour" name="createTour" :steps="steps" :options="tourOptions" :callbacks="tourCallbacks" />
    </div>
</template>

<script>
    import axios from 'axios'
    import { MIN_WORD_LENGTH, WORD_LIMIT, BLACK_LIST } from '../constants/index'
    import { apiError } from '../functions/index'
    import { setCookie } from '../functions/cookie'
    import PostModal from '../components/PostModal'
    import { NODE_URL } from '../../env'

    const TEXT = 'text'
    const LIST = 'list'
    const YOUTUBE = 'youtube'
    const YOUTUBE_REGEX = /((http(s)?:\/\/)?)(www\.)?((youtube\.com\/)|(youtu.be\/))[\S]+/

    export default {
        props: {
            slug: {
                type: String
            },
            saveApi: {
                type: String
            },
            topicApi: {
                type: String
            },
            topicStoreApi: {
                type: String
            },
            query: {
                type: String
            }
        },
        components: {
            PostModal
        },
        data() {
            return {
                rules: {
                    content: [
                        {
                            required: true, whitespace: true,
                            message: 'Vui lòng nhập nội dung', trigger: 'blur',
                        }
                    ],
                    topic: [
                        {required: true, message: 'Vui lòng chọn chủ đề', trigger: 'change'}
                    ]
                },
                topicLoading: false,
                loading: false,
                isShowForm: true,
                WORD_LIMIT,
                MIN_WORD_LENGTH,
                form: {
                    content: '',
                    topic: '',
                    url: '',
                    text: TEXT,
                    youtube: YOUTUBE,
                    list: LIST,
                    input: TEXT,
                    inputs: [
                        { label: TEXT, text: 'Văn bản'},
                        { label: YOUTUBE, text: 'Youtube'}
                    ],
                    youtubeURL: '',
                    webpageURL: ''
                },
                youtubeApi: NODE_URL + '/youtube',
                detectApi: NODE_URL + '/detect',
                tokenApi: NODE_URL + '/tokenize',
                topics: [],
                wordsCount: 0,
                inputVisible: false,
                inputValue: '',
                words: [],
                sentences: [],
                optionTopics: [],
                isShowPostData: false,
                lists: BLACK_LIST,
                exclude: true,
                maxNumber: WORD_LIMIT,
                minLength: MIN_WORD_LENGTH,
                allChecked: true,
                wordMaxText: 'Tổng số từ vựng tối đa cho mỗi chủ đề là ' + WORD_LIMIT,
                showContent: true,
                allLoading: false,
                startTour: false,
                tourOptions: {
                    useKeyboardNavigation: false,
                    labels: {
                        buttonSkip: 'Bỏ qua',
                        buttonPrevious: 'Trước đó',
                        buttonNext: 'Tiếp theo',
                        buttonStop: 'Hoàn thành'
                    }
                },
                steps: [
                ],
                tourCallbacks: {
                    onStop: this.onTourStop
                },
                saveResult: true,
                filterVocabApi: '/admin/vocab/api/filterVocab'
            }
        },
        computed: {
            selectionWords() {
                return this.words.filter(elm => elm.check === true)
            }
        },
        created() {
            if (this.query.length) {
                this.form.content = this.query
            }
            this.fetchTopic()
        },
        mounted: function () {
        },
        methods: {
            onTourStop() {
                this.stopTour();
            },
            stopTour() {
                setCookie("view_tour", "true", 1)
                this.startTour = false
            },
            fetchTopic() {
                this.topicLoading = true
                axios
                    .get(this.topicApi)
                    .then(response => {
                        this.optionTopics = response.data.data.topics
                        if (this.optionTopics.length) {
                            this.topics = this.optionTopics
                            let topic = this.topics[0]
                            if (this.slug.length) {
                                topic = this.topics.filter((item) => item.slug === this.slug)[0]
                            }

                            this.form.topic = topic['id']
                            this.form.url = topic['url']
                            this.wordsCount = topic['words_count']
                        } else {
                            apiError('Bạn chưa có chủ đề nào!')
                        }
                        this.topicLoading = false
                    })
                    .catch(() => {
                        apiError('Không thể lấy danh sách chủ đề')
                    });
            },
            getTopicLabel(item) {
                const wordsCount = item.words_count === undefined ? 0 : item.words_count
                return item.name + ` (${wordsCount})`;
            },
            changeTopic(id) {
                const index = this.topics.findIndex((elm) => elm.id === id)
                const item = this.topics[index];
                this.form.url = item.url
                this.wordsCount = item.words_count === undefined ? 0 : item.words_count
            },
            getContentLabel() {
                let label = ''
                switch (this.form.input) {
                    case this.form.text:
                        label = 'Văn bản tiếng Anh';
                        break;
                    case this.form.list:
                        label = 'Danh sách từ vựng (cách nhau dấu phẩy)';
                        break;
                    case this.form.youtube:
                        label = 'Phụ đề tiếng Anh';
                        break;
                }

                return label
            },
            showInput() {
                this.inputVisible = true;
                this.$nextTick(() => {
                    this.$refs.saveTopicInput.$refs.input.focus();
                });
            },
            handleInputConfirm() {
                let inputValue = this.inputValue;
                if (inputValue) {
                    axios
                        .post(this.topicStoreApi, {
                            name: inputValue
                        })
                        .then((response) => {
                            const topic = response.data.data.topic
                            this.optionTopics.push(topic)
                            this.form.topic = topic['id']
                            this.form.url = topic['url']
                        })
                        .catch(() => {
                            apiError('Không thể tạo chủ đề')
                        })
                }
                this.inputVisible = false;
                this.inputValue = '';
            },
            changeInput(label) {
                this.showContent = (label === this.form.text) || (label === this.form.list)
            },
            getCaption() {
                if (!YOUTUBE_REGEX.test(this.form.youtubeURL)) {
                    apiError('Not a Youtube video URL!')
                    return false
                }
                this.loading = true
                YOUTUBE_REGEX.test(this.form.youtubeURL) && axios
                    .post(this.youtubeApi, {
                        videoURL: this.form.youtubeURL
                    })
                    .then((response) => {
                        this.form.content = response.data.data.text
                        this.showContent = true
                    })
                    .catch(() => {
                        apiError('Can not get Youtube video caption!')
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (!valid) {
                        return false
                    }
                    this.validateTotal()
                    this.onSubmit()
                });
            },
            onSubmit() {
                this.loading = true
                axios
                    .post(this.filterVocabApi, {
                        words: this.words
                    }).then((res) => {
                        this.isShowForm = false
                        this.words = res.data.data.words
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            validateTotal() {
                this.textProcess();
                if (this.words.length > WORD_LIMIT) {
                    apiError(this.wordMaxText)
                    return false
                }
            },
            resetForm() {
                this.form.content = ''
            },
            handleClose(word) {
                const index = this.words.findIndex(item => item === word)
                this.words.splice(index, 1);
            },
            textProcess() {
                let words = this.form.content.trim().split(' ')
                words = words.filter((v, i) => words.indexOf(v) === i)
                words = words.map((v) => v.toLowerCase())
                if (this.exclude) {
                    words = words.filter((v) => v.length >= MIN_WORD_LENGTH)
                }
                this.words = words
            },
            showPostData() {
                this.isShowPostData = true
            },
            closePostData() {
                this.isShowPostData = false
                this.onCancel()
            },
            onReset() {
                this.form.content = ''
            },
            onCancel() {
                this.onReset()
                this.isShowForm = true
                this.words = []
                this.fetchTopic()
            },
            onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            },
            changeAll() {
                this.loading = true
                this.allChecked ? this.selectAll() : this.clearAll()
                this.loading = false
            },
            selectAll() {
                this.words.map(elm => elm.check = true)
            },
            clearAll() {
                this.words.map(elm => elm.check = false)
            },
            getWordType(check) {
                return check ? 'primary' : 'default'
            },
            getWordIcon(check) {
                return check ? 'el-icon-check' : 'el-icon-close'
            },
            handleCheck(word) {
                word.check = !word.check
            },
        }
    }
</script>
