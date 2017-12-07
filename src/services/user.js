import request from '../utils/request';

export async function fakeRegist(params) {
    return request('http://localhost:8080/user/regist', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}
export async function fakeLogin(params) {
    return request('http://localhost:8080/user/login', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}
export async function fakeLogout(params) {
    return request('http://localhost:8080/user/logout', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}
export async function fakeEdit(params) {
    return request('http://localhost:8080/user/edit', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}