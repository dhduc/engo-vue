<template>
    <div id="match">
        <el-row class="mobile-only">
            <p class="text-warning"><i class="el-icon-info text-warning"></i> Không hỗ trợ kéo thả trên điện thoại!</p>
        </el-row>
        <el-row class="el-header">
            <el-form ref="form" :model="form" :inline="true">
                <el-form-item label="">
                    <el-button :type="sound ? 'primary' : ''" icon="el-icon-set-up" title="Tự động" @click="sound = !sound">Âm thanh</el-button>
                </el-form-item>
                <el-form-item label="Số lượng">
                    <el-select v-model="limit" placeholder="" @change="changeLimit">
                        <el-option label="5" :value="5"></el-option>
                        <el-option label="10" :value="10"></el-option>
                        <el-option label="20" :value="20"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row>
            <div class="sound">
                <audio v-show="false" id="success-audio">
                    <source :src="successAudio" type="audio/mpeg">
                </audio>
                <audio v-show="false" id="failure-audio">
                    <source :src="failureAudio" type="audio/mpeg">
                </audio>
            </div>
        </el-row>
        <el-row v-if="sources.length == 0">
            <el-button icon="el-icon-refresh" type="primary" @click="goNext">Tiếp theo</el-button>
        </el-row>
        <el-row v-else>
            <div class="box" v-for="(item, index) in sources" :key="'sources' + item.id" @click="handleClick(item)">
                <el-collapse-transition>
                    <drop
                            @drop="handleDrop(item, ...arguments)"
                            class="card source stats-card bg radius-md margin-md shadow-xs col-2@sm"
                            :class="item.className"
                            @dragover="handleOverSource(item.id)"
                            @dragleave="handleLeaveSource(item.id)"
                    >
                        <drag class="card-body" :transfer-data="{ drag: item }">
                            {{ item.en + ' ' + item.phonetic }}
                        </drag>
                    </drop>
                </el-collapse-transition>
                <el-collapse-transition>
                    <drop
                            @drop="handleDrop(targets[index], ...arguments)"
                            class="card target stats-card bg radius-md margin-md shadow-xs col-2@sm"
                            :class="targets[index]['className']"
                            @dragover="handleOverTarget(targets[index]['id'])"
                            @dragleave="handleLeaveTarget(targets[index]['id'])"
                    >
                        <drag class="card-body" :transfer-data="{ drag: targets[index] }">
                            <span class="text text-primary">{{ targets[index]['vi'] + ' ' + targets[index]['type'] }}</span>
                        </drag>
                    </drop>
                </el-collapse-transition>
            </div>
        </el-row>
        <hr>
        <el-row>
            <p class="text-primary"><i class="el-icon-info text-primary"></i> Kéo thả các flash card để ghép thẻ</p>
        </el-row>
        <result-modal
            v-if="completed"
            :visible="completed"
            :correct="correct"
            :percent="100"
        />
    </div>
</template>

<script>
    import axios from 'axios'
    import {apiError} from '../functions/index'
    import {Drag, Drop} from 'vue-drag-drop';
    import ResultModal from '../components/ResultModal.vue'
    const SOURCE = 'source'
    const TARGET = 'target'
    const CLASS = 'over'
    const LIMIT = 10

    export default {
        name: "Drager",
        components: {
            'drag': Drag,
            'drop': Drop,
            'result-modal': ResultModal
        },
        props: {
            topicId: {
                type: Number
            },
            wordsApi: {
                type: String
            },
            successAudio: {
                type: String
            },
            failureAudio: {
                type: String
            },
        },
        data() {
            return {
                loading: false,
                offset: 0,
                limit: LIMIT,
                sound: false,
                questions: [],
                sources: [],
                targets: [],
                over: false,
                form: {},
                stack: {},
                completed: false,
                correct: 0
            }
        },
        async created() {
            await this.fetchQuestions()
            this.successPlayer = document.getElementById('success-audio');
            this.failurePlayer = document.getElementById('failure-audio');
        },
        mounted: function () {
        },
        methods: {
            async fetchQuestions() {
                this.loading = true
                const URL = this.wordsApi + '?offset=' + this.offset + '&limit=' + this.limit
                axios
                    .get(URL)
                    .then(response => {
                        this.questions = response.data.data.words
                        this.loading = false
                        this.getCards()
                        if (this.questions.length === 0) {
                            this.completed = true
                        }
                    })
                    .catch(() => {
                        apiError('Không thể lấy câu hỏi')
                    });
            },
            changeLimit() {
                if (this.sources.length !== 0) {
                    this.fetchQuestions()
                }
            },
            goNext() {
                this.offset += this.limit
                this.fetchQuestions()
            },
            getCards() {
                this.sources = JSON.parse(JSON.stringify(this.questions)).map(obj => ({
                    ...obj,
                    sort: SOURCE,
                    className: ''
                })).sort(() => Math.random() - 0.5)
                this.targets = JSON.parse(JSON.stringify(this.questions)).map(obj => ({
                    ...obj,
                    sort: TARGET,
                    className: ''
                })).sort(() => Math.random() - 0.5)
            },
            handleDrop(drop, data) {
                let drag = data.drag;
                if (drop.id === drag.id && drop.sort !== drag.sort) {
                    this.sources.splice(this.sources.findIndex(item => item.id === drag.id), 1)
                    this.targets.splice(this.targets.findIndex(item => item.id === drop.id), 1)
                    this.sound && this.successPlayer.play()
                    this.correct++

                    return
                }
                if (drop.sort === SOURCE) {
                    this.handleLeaveSource(drop.id)
                    return
                }
                if (drop.sort === TARGET) {
                    this.handleLeaveTarget(drop.id)
                }
            },
            handleOverSource(id) {
                this.sources[this.sources.findIndex(item => item.id === id)]['className'] = CLASS
            },
            handleLeaveSource(id) {
                this.sources[this.sources.findIndex(item => item.id === id)]['className'] = ''
            },

            handleOverTarget(id) {
                this.targets[this.targets.findIndex(item => item.id === id)]['className'] = CLASS
            },
            handleLeaveTarget(id) {
                this.targets[this.targets.findIndex(item => item.id === id)]['className'] = ''
            },

            handleClick(item) {
                if (this.stack.length === 0) {
                    this.stack = item;
                } else {
                    if (this.stack.id === item.id) {
                        // TODO
                    } else {
                        this.stack = {}
                    }
                }
            }
        }
    }
</script>
<style>

</style>
