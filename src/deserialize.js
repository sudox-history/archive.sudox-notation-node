"use strict";
const types = require("./constants/types");

const _UTF8 = "utf8";

/**
 * @type {Buffer}
 */
let _buf = null;
let _index = 0;

/**
 * @param {Buffer} buf
 * @param {Number} offset = 0
 * @returns {Boolean | Array | Object}
 */
function deserialize(buf, offset) {
    _index = offset;
    _buf = buf;

    let type = _buf[_index++];

    switch (type) {
        case types.ARR:
            return _readArr();

        case types.OBJ:
            return _readObj();
    }

    return false;
}

/**
 * @returns {Boolean}
 */
function _readBool() {
    let bool = _buf[_index++];

    return !!bool;
}

/**
 * @returns {Number}
 */
function _readNum() {
    let numLen = _buf[_index++];
    let num = _buf.readIntLE(_index, numLen);

    _index += numLen;
    return num;
}

/**
 * @returns {String}
 */
function _readStr() {
    let strLen = _buf.readUIntLE(_index, types.STR_HEAD_LEN);

    _index += types.STR_HEAD_LEN;
    return _buf.toString(_UTF8, _index, _index += strLen);
}

/**
 * @returns {Buffer}
 */
function _readBuf() {
    let bufLen = _buf.readUIntLE(_index, types.BUF_HEAD_LEN);

    _index += types.BUF_HEAD_LEN;
    return _buf.slice(_index, _index += bufLen);
}

/**
 * @returns {Array}
 */
function _readArr() {
    let arrLen = _buf.readUIntLE(_index, types.ARR_HEAD_LEN);
    let arr = [];

    _index += types.ARR_HEAD_LEN;

    for (let i = 0; i < arrLen; i++) {
        let type = _buf[_index++];

        switch (type) {
            case types.BOOL:
                arr.push(_readBool());
                break;

            case types.NUM:
                arr.push(_readNum());
                break;

            case types.STR:
                arr.push(_readStr());
                break;

            case types.BUF:
                arr.push(_readBuf());
                break;

            case types.ARR:
                arr.push(_readArr());
                break;

            case types.OBJ:
                arr.push(_readObj());
                break;
        }
    }

    return arr;
}

/**
 * @returns {Object}
 */
function _readObj() {
    let objLen = _buf.readUIntLE(_index, types.OBJ_HEAD_LEN);
    let obj = {};

    _index += types.OBJ_HEAD_LEN;

    for (let i = 0; i < objLen; i++) {
        let keyLen = _buf.readUIntLE(_index, types.OBJ_KEY_HEAD_LEN);

        _index += types.OBJ_KEY_HEAD_LEN;
        let key = _buf.toString(_UTF8, _index, _index += keyLen);

        let type = _buf[_index++];

        switch (type) {
            case types.BOOL:
                obj[key] = _readBool();
                break;

            case types.NUM:
                obj[key] = _readNum();
                break;

            case types.STR:
                obj[key] = _readStr();
                break;

            case types.BUF:
                obj[key] = _readBuf();
                break;

            case types.ARR:
                obj[key] = _readArr();
                break;

            case types.OBJ:
                obj[key] = _readObj();
                break;
        }
    }

    return obj;
}

module.exports = deserialize;