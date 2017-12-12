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

export async function savePrivateChatMsg(params) {
    return request('http://localhost:8080/chat/setPrivateChatMsg', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function getPrivateChatMsg() {
    return request('http://localhost:8080/chat/getPrivateChatMsg', {
        method: 'GET',
    });
}