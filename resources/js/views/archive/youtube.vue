<template>
    <div id="create">
        <el-form ref="form" :model="form" class="create" label-width="120px" label-position="top">
            <div>
                <el-form-item class="normal" label="Video URL">
                    <el-input type="url" v-model="form.youtubeURL" class="input-text"></el-input>
                    <el-button :loading="loading" type="primary" icon="el-icon-download" @click="getContent">Get</el-button>
                </el-form-item>

                <el-form-item v-if="showContent" class="normal" label="Caption" prop="content">
                    <el-input type="textarea" v-model="form.content" :rows="20"></el-input>
                </el-form-item>
            </div>
        </el-form>
    </div>
</template>

<script>
    import axios from 'axios'
    import { apiError } from '../functions/index'
    import { NODE_URL } from '../../env'

    export default {
        props: {
        },
        components: {
        },
        data() {
            return {
                loading: false,
                form: {
                    content: '',
                    youtubeURL: '',
                },
                youtubeApi: NODE_URL + '/youtube',
                showContent: true,
            }
        },
        computed: {
        },
        created() {
        },
        mounted: function () {
        },
        methods: {
            getContent() {
                this.loading = true
                axios
                    .post(this.youtubeApi, {
                        videoURL: this.form.youtubeURL
                    }, {
                        headers: {
                            'Access-Control-Allow-Origin': 'http://mobile.local',
                            'Content-Type': 'application/json',
                        },
                        withCredentials: true,
                        credentials: 'same-origin'
                    })
                    .then((response) => {
                        this.form.content = response.data.data.text
                        this.showContent = true
                    })
                    .catch(() => {
                        apiError('Can not get Youtube video caption')
                    })
                    .finally(() => {
                        this.loading = false
                    })
            }
        }
    }
</script>
