
//新建链接时会自动连接，并自动调用onopen方法
var ws = new WebSocket("wss://broadcastlv.chat.bilibili.com/sub");

ws.onopen = function () {
    document.getElementById("status").append("已连接");
    ws.send(encode(JSON.stringify({
        roomid: 5279/* 11365 *//* 66688 *///5086//7685334
        
    }), 7));
}



ws.onmessage = async function (msgEvent) {

    var read = new FileReader();
    read.readAsArrayBuffer(msgEvent.data)//从消息里面拿出数据包
    read.onload = function (eve) {
        let buffer = new Uint8Array(eve.target.result)//将二进制包转换成8位无符号整型数组
        let ver = readInt(buffer, 6, 2)
        let op = readInt(buffer, 8, 4)
        switch (ver) {
            case 0:
                let body = textDecoder.decode(buffer.slice(16))
                if (body)
                    console.log(JSON.parse(body));
                break;
            case 1:
                if (op == 8) {
                    console.log('认证成功开始心跳')
                    ws.send(encode('[object Object]', 2));
                    setInterval(function () {
                        ws.send(encode('[object Object]', 2));
                    }, 30000);
                }
                else {
                    let packetLen = readInt(buffer, 0, 4) - 16;
                    let pop = readInt(buffer, 16, packetLen)
                    console.log('气人值：' + pop)
                    document.getElementById("popularity").innerText='气人值：'+pop
                }
                break;
            case 2:
                let data = 0
                try {
                    data = pako.inflate(buffer.slice(16))
                    let last = data.byteLength
                    while (last > 0) {
                        let packetLen = readInt(data, 0, 4)
                        let body = textDecoder.decode(data.slice(16, packetLen))
                        if (body)
                            jsontoprint(JSON.parse(body));
                        data = data.slice(packetLen)
                        last = last - packetLen
                    }
                } catch (error) {

                }


                break;
            default:
                console.log('error')
                break;
        }


    }

};


const textEncoder = new TextEncoder('utf-8');
const textDecoder = new TextDecoder('utf-8');

const readInt = function (buffer, start, len) {
    let result = 0
    for (let i = len - 1; i >= 0; i--) {
        result += Math.pow(256, len - i - 1) * buffer[start + i]
    }
    return result
}

const writeInt = function (buffer, start, len, value) {
    let i = 0
    while (i < len) {
        buffer[start + i] = value / Math.pow(256, len - i - 1)
        i++
    }
}

const encode = function (str, op) {
    let data = textEncoder.encode(str);
    let packetLen = 16 + data.byteLength;
    let header = [0, 0, 0, 0, 0, 16, 0, 1, 0, 0, 0, op, 0, 0, 0, 1]
    writeInt(header, 0, 4, packetLen)
    return (new Uint8Array(header.concat(...data))).buffer
}

function jsontoprint(data) {
    switch (data.cmd) {
        /* case 'DANMU_MSG':
            //console.log(data.info[2][1]+':'+data.info[1]);
            //let para = document.createElement("p")
            //let node = document.createTextNode(data.info[2][1]+':'+data.info[1])
            //para.appendChild(node)
            //document.getElementById('danmu').append(data.info[2][1]+':'+data.info[1]+'\n')
            break; */
        case 'SUPER_CHAT_MESSAGE':
            console.log(data)
            document.getElementById('danmu').append(data.data.price+'$'+data.data.user_info.uname+':'+data.data.message+'\n')
            break
        default:
            console.log(data)
            //document.getElementById('danmu').append(data.cmd+'\n')

            break
    }


}