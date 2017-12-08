import request from '../utils/request';

export async function saveChatMsg(params) {
    return request('http://localhost:8080/chat/setChatMsg', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function getChatMsg() {
    return request('http://localhost:8080/chat/getChatMsg', {
        method: 'GET',
    });
}