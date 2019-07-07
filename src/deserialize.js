"use strict";
const consts = require("./consts");

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
function deserialize(buf, offset = 0) {
    _index = offset;
    _buf = buf;

    let type = _buf[_index++];

    switch (type) {
        case consts.ARR_TYPE:
            return _readArr();

        case consts.OBJ_TYPE:
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
    let numLen = _buf.readUIntLE(_index, consts.NUM_HEAD_LEN);

    _index += consts.NUM_HEAD_LEN;
    let num = _buf.readIntLE(_index, numLen);

    _index += numLen;
    return num;
}

/**
 * @returns {String}
 */
function _readStr() {
    let strLen = _buf.readUIntLE(_index, consts.STR_HEAD_LEN);

    _index += consts.STR_HEAD_LEN;
    return _buf.toString(_UTF8, _index, _index += strLen);
}

/**
 * @returns {Buffer}
 */
function _readBuf() {
    let bufLen = _buf.readUIntLE(_index, consts.BUF_HEAD_LEN);

    _index += consts.BUF_HEAD_LEN;
    return _buf.slice(_index, _index += bufLen);
}

/**
 * @returns {Array}
 */
function _readArr() {
    let arrLen = _buf.readUIntLE(_index, consts.ARR_HEAD_LEN);
    let arr = [];

    _index += consts.ARR_HEAD_LEN;

    for (let i = 0; i < arrLen; i++) {
        let type = _buf[_index++];

        switch (type) {
            case consts.BOOL_TYPE:
                arr.push(_readBool());
                break;

            case consts.NUM_TYPE:
                arr.push(_readNum());
                break;

            case consts.STR_TYPE:
                arr.push(_readStr());
                break;

            case consts.BUF_TYPE:
                arr.push(_readBuf());
                break;

            case consts.ARR_TYPE:
                arr.push(_readArr());
                break;

            case consts.OBJ_TYPE:
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
    let objLen = _buf.readUIntLE(_index, consts.OBJ_HEAD_LEN);
    let obj = {};

    _index += consts.OBJ_HEAD_LEN;

    for (let i = 0; i < objLen; i++) {
        let keyLen = _buf.readUIntLE(_index, consts.OBJ_KEY_HEAD_LEN);

        _index += consts.OBJ_KEY_HEAD_LEN;
        let key = _buf.toString(_UTF8, _index, _index += keyLen);

        let type = _buf[_index++];

        switch (type) {
            case consts.BOOL_TYPE:
                obj[key] = _readBool();
                break;

            case consts.NUM_TYPE:
                obj[key] = _readNum();
                break;

            case consts.STR_TYPE:
                obj[key] = _readStr();
                break;

            case consts.BUF_TYPE:
                obj[key] = _readBuf();
                break;

            case consts.ARR_TYPE:
                obj[key] = _readArr();
                break;

            case consts.OBJ_TYPE:
                obj[key] = _readObj();
                break;
        }
    }

    return obj;
}

module.exports = deserialize;
