"use strict";
const consts = require("./consts");

const _BUF_LEN = 16777215;

/**
 * @type {Buffer}
 */
let _buf = Buffer.alloc(_BUF_LEN);
let _index = 0;

/**
 * @param {Array | Object} obj
 * @param {Number} offset = 0
 * @param {Number} bufLen = _BUF_LEN
 * @returns {Boolean | Buffer}
 */
function serialize(obj, offset = 0, bufLen = _BUF_LEN) {
    _index = offset;

    if (_buf.length < bufLen) {
        _buf = Buffer.alloc(bufLen);
    }

    switch (obj.constructor) {
        case Array:
            _writeArr(obj);
            break;

        case Object:
            _writeObj(obj);
            break;

        default:
            return false;
    }

    let buf = Buffer.alloc(_index);
    _buf.copy(buf);

    return  buf;
}

/**
 * @param {Boolean} bool
 * @returns {Boolean}
 */
function _writeBool(bool) {
    _buf[_index++] = consts.BOOL_TYPE;

    _buf[_index++] = +bool;
    return true;
}

/**
 * @param {Number} num
 * @returns {Boolean}
 */
function _writeNum(num) {
    _buf[_index++] = consts.NUM_TYPE;

    let numLen = 0;

    if (num > 0) {
        numLen = Math.floor((Math.log2(num) + 1) / 8) + 1;
    } else if (num < 0) {
        numLen = Math.ceil((Math.log2(Math.abs(num)) + 1) / 8);
    } else {
        numLen = 1;
    }

    _index = _buf.writeUIntLE(numLen, _index, consts.NUM_HEAD_LEN);
    _index = _buf.writeIntLE(num, _index, numLen);

    return true;
}

/**
 * @param {String} str
 * @returns {Boolean}
 */
function _writeStr(str) {
    _buf[_index++] = consts.STR_TYPE;

    let strHeadIndex = _index;
    let strLen = _buf.write(str, _index += consts.STR_HEAD_LEN);

    _index += strLen;
    _buf.writeUIntLE(strLen, strHeadIndex, consts.STR_HEAD_LEN);

    return true;
}

/**
 * @param {Buffer} buf
 * @returns {Boolean}
 */
function _writeBuf(buf) {
    _buf[_index++] = consts.BUF_TYPE;

    _index = _buf.writeUIntLE(buf.length, _index, consts.BUF_HEAD_LEN);
    _index += buf.copy(_buf, _index);

    return true;
}

/**
 * @param {Array} arr
 * @returns {Boolean}
 */
function _writeArr(arr) {
    _buf[_index++] = consts.ARR_TYPE;

    let arrLen = arr.length;
    _index = _buf.writeUIntLE(arrLen, _index, consts.ARR_HEAD_LEN);

    for (let i = 0; i < arrLen; i++) {
        if (arr[i] === null) {
            continue;
        }

        switch (typeof arr[i]) {
            case "boolean":
                _writeBool(arr[i]);
                break;

            case "number":
                _writeNum(arr[i]);
                break;

            case "string":
                _writeStr(arr[i]);
                break;
        }

        switch (arr[i].constructor) {
            case Buffer:
                _writeBuf(arr[i]);
                break;

            case Array:
                _writeArr(arr[i]);
                break;

            case Object:
                _writeObj(arr[i]);
                break;
        }
    }

    return true;
}

/**
 * @param {Object} obj
 * @returns {Boolean}
 */
function _writeObj(obj) {
    _buf[_index++] = consts.OBJ_TYPE;

    let objHeadIndex = _index;
    let objLen = 0;

    _index += consts.OBJ_HEAD_LEN;

    for (let key in obj) {
        if (obj[key] === null) {
            continue;
        }

        let keyHeadIndex = _index;
        let keyLen = _buf.write(key, _index += consts.OBJ_KEY_HEAD_LEN);

        _index += keyLen;
        _buf.writeUIntLE(keyLen, keyHeadIndex, consts.OBJ_KEY_HEAD_LEN);

        switch (typeof obj[key]) {
            case "boolean":
                _writeBool(obj[key]);
                break;

            case "number":
                _writeNum(obj[key]);
                break;

            case "string":
                _writeStr(obj[key]);
                break;
        }

        switch (obj[key].constructor) {
            case Buffer:
                _writeBuf(obj[key]);
                break;

            case Array:
                _writeArr(obj[key]);
                break;

            case Object:
                _writeObj(obj[key]);
                break;
        }

        objLen++;
    }

    _buf.writeUIntLE(objLen, objHeadIndex, consts.OBJ_HEAD_LEN);
    return true;
}

module.exports = serialize;