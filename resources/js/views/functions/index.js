import axios from 'axios'
import { Message } from 'element-ui'

const UPDATE_API = ''
export function updateWord(data) {
    return axios
        .post(UPDATE_API, data)
        .then(() => {
        })
        .catch(() => {
        })
        .finally(() => {
        })
}

export function apiSuccess(message, showClose = true) {
    Message({
        showClose: showClose,
        message: message,
        type: 'success'
    });
}

export function apiError(message = null, showClose = true) {
    Message({
        showClose: showClose,
        message: message ? message : 'Xin lỗi, đã có lỗi xảy ra!.',
        type: 'error'
    });
}
