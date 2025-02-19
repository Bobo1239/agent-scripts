// ==UserScript==
// @name         [0100D11018A7E000] Aquarium
// @version      0.1 - 1.0.0
// @author       [DC]
// @description  Yuzu
// * ENTERGRAM
// * 
// ==/UserScript==
const gameVer = '1.0.0';

const { setHook } = require('./libYuzu.js');

const mainHandler = trans.send(handler, '200+'); // join 200ms

setHook({
    '1.0.0': {
        0x851a990: mainHandler.bind_(null, 0, 1), // x0 - name
        0x851a9a8: mainHandler.bind_(null, 0, 0), // x0 - dialogue
        0x8500178: mainHandler.bind_(null, 0, 0), // x0 - choice
        //0x85622AC: mainHandler, // x1 - dialogue - name - choice
    }
}[globalThis.gameVer ?? gameVer]);

function handler(regs, index, offset) {
    console.log('onEnter');
    const address = regs[index].value.add(offset); // x0
    //console.log(hexdump(address, { header: false, ansi: false, length: 0x50 }));
    let s = readString(address);
    return s;
}


function readString(address) {
    let s = address.readUtf8String();
    const parts = s.split(/(?=@.)/g);
    s = '';
    let counter = 0;
    while (counter < parts.length) {
        const part = parts[counter];
        if (part.startsWith('@') === false) {
            s += part;
            counter++;
            continue;
        }
        const tag = part.substring(0, 2);
        const content = part.substring(2);
        switch (tag) {
            // @v20372@s5050「くらえっ！　セクシーービーーーーム！！」
            // @v10446「や、や……やっ！　@t0321@hHUBUKI_U101EG2やったあああああああ！！！」@k
            case '@s':
            case '@t':
                s += content.substring(4);
                counter++
                continue;
            // @v01856@m00@a「あと……大切な人と過ごした、忘れられない日々」
            case '@m':
                s += content.substring(2);
                counter++
                continue;

            case '@n':
                s += '\n' + content;
                counter++
                continue;
            // あくあさんの肩の力が抜け、柔らかい笑みを向けてくる。@p@nそれを見た瞬間、僕の心臓が大きく跳ねた。@k
            case '@b':
            case '@a':
            case '@p':
            case '@k':
                s += content;
                counter++
                continue;
            // @v00095「うん、その………@t0242@hAQUA_A102TRあ、ありがとう」
            // @vRYU_01100010「よう、作家先生のお出ましじゃないか」
            case '@v':
            case '@h':
                s += content.replace(/[\w_-]+/g, '');
                counter++
                continue;
            // 差し出された酒を遠慮なく@r呷@あお@る。
            case '@r':
                s += content + parts[counter + 2].substring(1);
                counter += 3;
                continue;
            // @I771418──穢れた生き物を@I@
            // @I771418──@r屠@ほふ@れ@I@
            case '@I':
                if (content == '@' || parts[counter + 1].substring(0, 2) == '@r') {
                    counter++
                    continue;
                }
                s += content.replace(/[\d+─]/g, '');
                counter += 3;
                continue;
            default:
                console.log('Unrecognized dialogue tag: ' + tag);
                s += content;
                counter++
                continue;
        }
    }
    return s;
}