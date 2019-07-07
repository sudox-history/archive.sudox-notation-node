"use strict";
const BOOL_TYPE = 10;
const BOOL_HEAD_LEN = null; // Type boolean doesn't need header

const NUM_TYPE = 20;
const NUM_HEAD_LEN = 1;

const STR_TYPE = 30;
const STR_HEAD_LEN = 3;

const BUF_TYPE = 40;
const BUF_HEAD_LEN = 3;

const ARR_TYPE = 50;
const ARR_HEAD_LEN = 2;

const OBJ_TYPE = 60;
const OBJ_HEAD_LEN = 2;

const OBJ_KEY_TYPE = null; // Type object key doesn't need identification
const OBJ_KEY_HEAD_LEN = 1;

module.exports = {
    BOOL_TYPE,
    BOOL_HEAD_LEN,

    NUM_TYPE,
    NUM_HEAD_LEN,

    STR_TYPE,
    STR_HEAD_LEN,

    BUF_TYPE,
    BUF_HEAD_LEN,

    ARR_TYPE,
    ARR_HEAD_LEN,

    OBJ_TYPE,
    OBJ_HEAD_LEN,

    OBJ_KEY_TYPE,
    OBJ_KEY_HEAD_LEN
};
